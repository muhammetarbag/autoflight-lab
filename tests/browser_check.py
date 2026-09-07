"""Browser acceptance checks against the real UI; no test-only model API."""
from __future__ import annotations

import json
import os
import re
import traceback
from pathlib import Path
from typing import Callable

from playwright.sync_api import Browser, Page, expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
BASE = os.environ.get("LAB_URL", "http://127.0.0.1:3022").rstrip("/")
CHROME = os.environ.get("CHROME_PATH", "/home/muhammet/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome")
LABS = ["fundamentals", "axes", "yaw", "trim", "modes", "navigation", "throttle", "autoland", "sas", "architecture", "interfaces", "components", "faults", "sandbox", "quiz"]


class Checks:
    def __init__(self, browser: Browser) -> None:
        self.page = browser.new_page(viewport={"width": 1512, "height": 1080}, reduced_motion="reduce")
        self.page.clock.install()
        self.errors: list[str] = []
        self.results: list[dict[str, str]] = []
        self.interactions: set[str] = set()
        self.visit_count = 0
        self.page.on("pageerror", lambda e: self.errors.append(str(e)))
        self.page.on("console", lambda m: self.errors.append(m.text) if m.type == "error" else None)
        self.page.on("response", lambda r: self.errors.append(f"HTTP {r.status} {r.url}") if r.url.startswith(BASE) and r.status >= 400 else None)

    def visit(self, lab: str) -> None:
        self.visit_count += 1
        self.page.goto(f"{BASE}/?check={self.visit_count}#{lab}", wait_until="networkidle")
        expect(self.page.locator("h1")).to_be_visible()
        self.page.clock.run_for(100)

    def record(self, name: str, fn: Callable[[], None]) -> None:
        try:
            fn()
            self.results.append({"name": name, "status": "passed"})
            print(f"PASS {name}", flush=True)
        except Exception as exc:
            self.results.append({"name": name, "status": "failed", "error": str(exc)})
            self.page.screenshot(path=str(ARTIFACTS / f"failure-{len(self.results)}.png"), full_page=True)
            print(f"FAIL {name}: {exc}", flush=True)
            traceback.print_exc()

    def set_range(self, name: str, value: float) -> None:
        slider = self.page.get_by_role("slider", name=name, exact=True)
        slider.evaluate("""(element, value) => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, String(value));
          element.dispatchEvent(new Event('input', {bubbles:true}));
          element.dispatchEvent(new Event('change', {bubbles:true}));
        }""", value)
        expect(slider).to_have_value(str(value))
        self.interactions.add(f"range:{name}")

    def reset(self) -> None:
        self.page.get_by_role("button", name="RESET LAB", exact=True).click()
        self.page.clock.run_for(100)

    def number(self, label: str) -> float:
        text = self.page.locator(".metric").filter(has=self.page.locator("span", has_text=re.compile(f"^{re.escape(label)}$"))).first.locator("strong").inner_text()
        return float(re.search(r"-?\d+(?:\.\d+)?", text)[0])

    def inventory(self, lab: str) -> None:
        self.visit(lab)
        page = self.page
        assert page.locator(".nav-group a").count() == 15
        assert page.locator(".nav-group a[aria-current=page]").get_attribute("href") == f"#{lab}"
        expect(page.locator(".learn-strip")).to_be_visible()
        expect(page.locator(".why-panel")).to_be_visible()
        assert "Simplified educational model — not aircraft-specific." in page.locator("footer").inner_text()
        # Exercise every enabled range by real keyboard input at both limits.
        if lab == "throttle":
            page.get_by_role("switch", name="AUTOTHROTTLE", exact=False).click()
        for slider in page.get_by_role("slider").all():
            name = slider.get_attribute("aria-label") or ""
            if slider.is_disabled():
                continue
            slider.focus()
            slider.press("End")
            assert float(slider.input_value()) == float(slider.get_attribute("max") or 0)
            slider.press("Home")
            assert float(slider.input_value()) == float(slider.get_attribute("min") or 0)
            self.interactions.add(f"{lab}:slider:{name}")
        if lab != "quiz":
            self.reset()
        for switch in page.get_by_role("switch").all():
            initial = switch.get_attribute("aria-checked")
            name = switch.inner_text()
            switch.click()
            expect(switch).to_have_attribute("aria-checked", "false" if initial == "true" else "true")
            switch.click()
            expect(switch).to_have_attribute("aria-checked", initial or "false")
            self.interactions.add(f"{lab}:switch:{name}")
        for name in page.locator(".failure-buttons button").all_text_contents():
            button = page.get_by_role("button", name=name, exact=True)
            button.click()
            expect(button).to_have_attribute("aria-pressed", "true")
            assert page.locator(".fault-explanation").count() > 0
            button.click()
            expect(button).to_have_attribute("aria-pressed", "false")
            self.interactions.add(f"{lab}:failure:{name}")
        if lab != "quiz":
            self.reset()
            assert page.locator(".fault-active").count() == 0
            expect(page.get_by_role("button", name="1×", exact=True)).to_have_attribute("aria-pressed", "true")
        assert not page.get_by_text(re.compile(r"\b(NaN|undefined|TODO|placeholder)\b", re.I)).count()
        page.screenshot(path=str(ARTIFACTS / f"{lab}-desktop.png"), full_page=True)

    def modes(self) -> None:
        self.visit("modes")
        p = self.page
        p.get_by_role("button", name="Simülasyonu duraklat").click()
        before = p.locator(".sim-clock strong").inner_text()
        p.clock.run_for(3000)
        assert p.locator(".sim-clock strong").inner_text() == before
        self.set_range("Selected heading", 150)
        p.get_by_role("button", name="HDG", exact=True).click()
        p.get_by_role("button", name="12×", exact=True).click()
        p.get_by_role("button", name="Simülasyonu sürdür").click()
        p.clock.run_for(8000)
        assert abs(self.number("HEADING ERROR")) < 1
        self.set_range("Selected altitude", 4000)
        p.get_by_role("button", name="ALT ACQ", exact=True).click()
        expect(p.locator(".fma")).to_contain_text("ARMED ALT")
        p.clock.run_for(15000)
        assert abs(self.number("ALT TARGET ERROR")) < 5
        expect(p.locator(".fma")).to_contain_text("ALT HOLD")
        p.get_by_role("button", name="ALT HOLD", exact=True).click()
        self.set_range("Selected altitude", 6000)
        self.set_range("Vertical speed target", 1000)
        p.get_by_role("button", name="VS", exact=True).click()
        p.clock.run_for(2000)
        expect(p.locator(".fma")).to_contain_text("VS")
        p.get_by_role("button", name="NAV", exact=True).click()
        p.clock.run_for(24000)
        expect(p.locator(".fma")).to_contain_text("NAV")
        p.get_by_role("button", name="APP", exact=True).click()
        expect(p.locator(".fma")).to_contain_text("ARMED LOC")
        p.get_by_role("button", name="GO AROUND", exact=True).click()
        expect(p.locator(".fma")).to_contain_text("GA")
        p.get_by_role("button", name="4×", exact=True).click()
        expect(p.get_by_role("button", name="4×", exact=True)).to_have_attribute("aria-pressed", "true")
        self.reset()
        assert self.number("HEADING ERROR") == 0
        self.interactions.update(f"mode:{m}" for m in ["HDG", "NAV", "ALT HOLD", "ALT ACQ", "VS", "APP", "GO AROUND", "1×", "4×", "12×", "pause", "resume", "reset"])

    def disturbances(self) -> None:
        for lab in ["axes", "yaw", "trim", "sas", "sandbox"]:
            self.visit(lab)
            p = self.page
            buttons = p.get_by_role("button", name=re.compile("darbesi|Üç eksen"))
            for button in buttons.all():
                name = button.inner_text()
                before = p.locator(".chart-legend").all_text_contents()
                button.click()
                p.clock.run_for(600)
                assert p.locator(".chart-legend").all_text_contents() != before
                self.interactions.add(f"{lab}:disturbance:{name}")

    def landing(self) -> None:
        self.visit("autoland")
        p = self.page
        self.set_range("Approach lateral offset", -400)
        self.set_range("Glideslope offset", 200)
        self.set_range("Approach crosswind", 20)
        p.get_by_role("button", name="APP ARM", exact=True).click()
        expect(p.get_by_role("slider", name="Approach lateral offset")).to_be_disabled()
        p.get_by_role("button", name="12×", exact=True).click()
        p.clock.run_for(23000)
        expect(p.locator(".phase-banner strong")).to_have_text("TOUCHDOWN")
        assert self.number("ALTITUDE / RA*") == 0
        assert p.locator(".phase-progress .done").count() == 7
        p.screenshot(path=str(ARTIFACTS / "autoland-touchdown.png"), full_page=True)
        self.reset()
        p.get_by_role("button", name="APP ARM", exact=True).click()
        p.get_by_role("button", name="12×", exact=True).click()
        p.clock.run_for(4000)
        p.get_by_role("button", name="RADIO ALTIMETER FAIL", exact=True).click()
        expect(p.locator(".phase-banner strong")).to_have_text("INTERRUPTED")
        expect(p.locator(".warning-strip")).to_contain_text("AUTOLAND UNAVAILABLE")
        p.get_by_role("button", name="GO-AROUND", exact=True).click()
        p.clock.run_for(2000)
        expect(p.locator(".phase-banner strong")).to_have_text("GO-AROUND")
        assert self.number("ALTITUDE / RA*") > 1000
        self.interactions.update(["autoland:APP ARM", "autoland:GO-AROUND", "autoland:critical failure"])

    def navigation(self) -> None:
        self.visit("navigation")
        p = self.page
        for button in p.locator(".sensor-route button").all():
            button.click()
            expect(button).to_have_attribute("aria-pressed", "true")
            expect(button).to_contain_text("INVALID")
            button.click()
            expect(button).to_have_attribute("aria-pressed", "false")
        self.reset()
        p.get_by_role("button", name="NAV intercept başlat").click()
        expect(p.locator(".fma")).to_contain_text("NAV INT")
        p.get_by_role("button", name="APP yaklaşmasını hazırla").click()
        expect(p.locator(".fma")).to_contain_text("G/S INT")
        p.get_by_role("button", name="Heading hedefini 150° yap").click()
        expect(p.locator(".pfd svg")).to_be_visible()
        self.interactions.update(["navigation:7 sensors", "navigation:NAV", "navigation:APP", "navigation:HDG target"])

    def fundamentals(self) -> None:
        self.visit("fundamentals")
        p = self.page
        for button in p.locator(".loop-node").all():
            button.click()
            expect(button).to_have_class(re.compile("selected"))
            expect(p.locator(".component-detail h3")).to_be_visible()
        p.get_by_role("button", name=re.compile("Adım modu")).click()
        before = p.locator(".loop-progress").inner_text()
        p.get_by_role("button", name="Sonraki sinyal").click()
        assert p.locator(".loop-progress").inner_text() != before
        p.locator(".feedback-return").click()
        expect(p.locator(".loop-progress")).to_contain_text("STAGE 9")
        p.get_by_role("button", name="090° → 150° deneyini uygula").click()
        expect(p.get_by_role("slider", name="Commanded heading")).to_have_value("150")
        self.reset()
        expect(p.get_by_role("button", name="Adım modu OFF")).to_be_visible()
        self.interactions.add("fundamentals:all stages, step, feedback, preset")

    def architecture(self) -> None:
        self.visit("architecture")
        p = self.page
        for pin in p.locator(".location-pin").all():
            pin.click()
            expect(pin).to_have_attribute("aria-pressed", "true")
            for button in p.locator(".component-list button").all():
                name = button.locator("span").first.inner_text().splitlines()[0]
                button.click()
                expect(p.locator(".component-detail h3")).to_have_text(name)
        self.interactions.add("architecture:9 locations and every associated component")

    def interfaces(self) -> None:
        self.visit("interfaces")
        p = self.page
        for button in p.locator(".interface-ports button").all():
            name = button.inner_text()
            button.click()
            expect(p.locator(".component-detail h3")).to_have_text(name)
        # Real mouse hit-testing catches overlays that synthetic dispatch bypasses.
        board = p.locator('.interface-board > svg')
        board.scroll_into_view_if_needed()
        box = board.bounding_box()
        assert box is not None
        port_names = p.locator('.interface-ports button').all_text_contents()
        for index, name in enumerate(port_names):
            x = 275 if index < 6 else 725
            y = 36 + (index % 6) * 70
            p.mouse.click(box['x'] + box['width'] * x / 1000,
                          box['y'] + box['height'] * y / 426)
            expect(p.locator('.component-detail h3')).to_have_text(name)
        p.get_by_role("button", name="Trace Signal başlat").click()
        p.clock.run_for(1900)
        expect(p.locator(".trace-chain .current")).not_to_have_text("Selected Altitude")
        p.get_by_role("button", name="Trace Signal durdur").click()
        before = p.locator(".trace-chain .current").inner_text()
        p.get_by_role("button", name="Sonraki adım", exact=True).click()
        assert p.locator(".trace-chain .current").inner_text() != before
        self.interactions.add("interfaces:12 ports, connection line, trace, manual step")

    def component_library(self) -> None:
        self.visit("components")
        p = self.page
        assert p.locator(".component-tile").count() == 19
        for tile in p.locator(".component-tile").all():
            name = tile.locator("strong").inner_text()
            tile.click()
            expect(p.locator(".component-detail h3")).to_have_text(name)
        for button in p.locator(".filter-buttons button").all():
            button.click()
            assert p.locator(".component-tile").count() > 0
        p.get_by_role("button", name="Tümü", exact=True).click()
        p.get_by_role("textbox", name="Bileşen ara").fill("Radio Altimeter")
        assert p.locator(".component-tile").count() == 1
        p.get_by_role("textbox", name="Bileşen ara").fill("no-such-component")
        expect(p.locator(".empty-state")).to_be_visible()
        self.reset()
        assert p.locator(".component-tile").count() == 19
        self.interactions.add("components:19 cards, all family filters, search, empty, reset")

    def troubleshooting(self) -> None:
        self.visit("faults")
        p = self.page
        for index, answer in enumerate([0, 1, 2, 3, 0, 1, 2]):
            p.locator(".case-tabs button").nth(index).click()
            assert p.locator(".answer-feedback").count() == 0
            expect(p.get_by_role("button", name="Teşhisi kontrol et")).to_be_disabled()
            for button in p.locator(".inspection-list button").all():
                button.click()
                expect(button).to_have_attribute("aria-expanded", "true")
            p.get_by_role("radio").nth((answer + 1) % 4).click()
            p.get_by_role("button", name="Teşhisi kontrol et").click()
            expect(p.locator(".answer-feedback")).to_have_class(re.compile("incorrect"))
            p.get_by_role("button", name="Yeniden değerlendir").click()
            p.get_by_role("radio").nth(answer).click()
            p.get_by_role("button", name="Teşhisi kontrol et").click()
            expect(p.locator(".answer-feedback")).to_have_class(re.compile("correct"))
        expect(p.locator(".case-progress")).to_contain_text("7 / 7")
        self.reset()
        expect(p.locator(".case-progress")).to_contain_text("0 / 7")
        self.interactions.add("troubleshooting:7 cases,28 inspections,wrong/correct/retry/reset")

    def quiz(self) -> None:
        self.visit("quiz")
        p = self.page
        p.get_by_role("button", name="Sınavı sıfırla").click()
        assert p.locator(".answer-feedback").count() == 0
        expect(p.get_by_role("button", name="Yanıtı kontrol et")).to_be_disabled()
        # All A choices deliberately mix correct/incorrect (7 correct out of 28).
        for index in range(28):
            p.get_by_role("button", name=f"Soru {index+1}", exact=True).click()
            assert p.locator(".answer-feedback").count() == 0
            p.get_by_role("radio").first.click()
            p.get_by_role("button", name="Yanıtı kontrol et").click()
            expect(p.locator(".answer-feedback")).to_be_visible()
            expect(p.get_by_role("radio").first).to_be_disabled()
        assert self.number("CORRECT") == 7
        assert self.number("INCORRECT") == 21
        assert self.number("COMPLETION") == 100
        expect(p.locator(".quiz-complete")).to_be_visible()
        p.get_by_role("button", name="Önceki", exact=True).click()
        p.get_by_role("button", name="Sonraki", exact=True).click()
        p.reload(wait_until="networkidle")
        assert self.number("CORRECT") == 7
        p.get_by_role("button", name="Sınavı sıfırla").click()
        assert self.number("COMPLETION") == 0
        assert p.locator(".answer-feedback").count() == 0
        # Untrusted browser storage must not create invalid score indices.
        p.evaluate("localStorage.setItem('aee303-quiz-v1', JSON.stringify({'500':8, '-1':0, '2':null, '3':'x'}))")
        p.reload(wait_until="networkidle")
        assert self.number("COMPLETION") == 0
        self.interactions.add("quiz:28 submissions, scoring, map, previous/next, reload, reset, invalid storage")

    def sources(self) -> None:
        self.visit("modes")
        p = self.page
        p.get_by_role("button", name="Model & kaynaklar", exact=True).click()
        expect(p.get_by_role("dialog")).to_be_visible()
        assert p.locator(".source-links a").count() == 4
        assert p.evaluate("document.activeElement.closest('dialog') !== null")
        p.get_by_role("button", name="Kaynakları kapat").click()
        assert p.get_by_role("dialog").count() == 0
        p.get_by_role("button", name="Model varsayımları & kaynaklar", exact=True).click()
        p.get_by_role("button", name="Laboratuvara dön").click()
        p.get_by_role("button", name="Model & kaynaklar", exact=True).click()
        p.keyboard.press("Escape")
        assert p.get_by_role("dialog").count() == 0
        self.interactions.add("sources:both entry points,close,return,Escape")

    def responsive(self) -> None:
        p = self.page
        for width in [390, 768, 320]:
            p.set_viewport_size({"width": width, "height": 844})
            for lab in LABS:
                self.visit(lab)
                geometry = p.evaluate("({width:innerWidth,scroll:document.documentElement.scrollWidth})")
                assert geometry["scroll"] <= geometry["width"] + 1, f"{lab} at {width}: {geometry}"
                assert p.locator("h1").is_visible()
                if width == 390:
                    p.screenshot(path=str(ARTIFACTS / f"{lab}-mobile.png"), full_page=True)
            if width < 760:
                p.get_by_role("button", name="Laboratuvar menüsü").click()
                expect(p.locator(".sidebar")).to_have_class(re.compile("mobile-open"))
                p.locator('.nav-group a[href="#yaw"]').click()
                expect(p.locator("h1")).to_have_text("Yaw Damper Lab")
                assert "mobile-open" not in (p.locator(".sidebar").get_attribute("class") or "")
                p.get_by_role("button", name="Laboratuvar menüsü").click()
                p.get_by_role("button", name="Navigasyonu kapat").click()
                p.get_by_role("button", name="Laboratuvar menüsü").click()
                p.get_by_role("button", name="Menüyü kapat", exact=True).click(position={"x": width - 15, "y": 400})
        p.set_viewport_size({"width": 1512, "height": 1080})
        self.interactions.add("responsive:all 15 labs at 320/390/768, mobile menu/link/close/backdrop")


def main() -> None:
    ARTIFACTS.mkdir(exist_ok=True)
    with sync_playwright() as playwright:
        launch = {"headless": True}
        if Path(CHROME).exists():
            launch["executable_path"] = CHROME
        browser = playwright.chromium.launch(**launch)
        checks = Checks(browser)
        for lab in LABS:
            checks.record(f"{lab}: controls, failures, reset, content", lambda lab=lab: checks.inventory(lab))
        for name, method in [
            ("MCP modes and smooth target response", checks.modes),
            ("All disturbance buttons change live response", checks.disturbances),
            ("Autoland capture / touchdown / failure / GA", checks.landing),
            ("Navigation input routing", checks.navigation),
            ("Closed-loop stages and stepping", checks.fundamentals),
            ("Architecture locations and component cards", checks.architecture),
            ("FCC connections and trace controls", checks.interfaces),
            ("Component library filters and search", checks.component_library),
            ("Seven complete diagnosis workflows", checks.troubleshooting),
            ("28 quiz answers, score and persistence", checks.quiz),
            ("Sources, modal focus and keyboard close", checks.sources),
            ("All mobile/tablet layouts and navigation", checks.responsive),
        ]:
            checks.record(name, method)
        checks.results.append({"name": "No JavaScript / console / asset errors", "status": "failed" if checks.errors else "passed"})
        report = {"base_url": BASE, "browser": browser.version, "checks": checks.results, "errors": checks.errors, "interactions": sorted(checks.interactions)}
        (ARTIFACTS / "browser-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
        failed = [r for r in checks.results if r["status"] == "failed"]
        print(f"RESULT: {len(checks.results)-len(failed)}/{len(checks.results)} passed; {len(checks.interactions)} interaction groups; {len(checks.errors)} browser errors", flush=True)
        browser.close()
        if failed:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
