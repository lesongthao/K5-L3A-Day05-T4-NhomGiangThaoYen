"""Business-flow checks against the actual browser UI; Edge must be installed.
Run from repository root: py -X utf8 prototype/tests/browser_check.py
"""
from pathlib import Path
import json
import unittest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PAGE = (ROOT / "prototype" / "index.html").as_uri()

class PrototypeChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(channel="msedge", headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page(viewport={"width":1440,"height":1100})
        self.errors = []
        self.network = []
        self.page.on("pageerror", lambda err: self.errors.append(str(err)))
        self.page.on("request", lambda req: self.network.append(req.url) if req.url.startswith(("http:", "https:")) else None)
        self.page.goto(PAGE)

    def tearDown(self):
        self.assertEqual(self.errors, [], "Uncaught JavaScript error")
        self.assertEqual(self.network, [], "Prototype should not contact an external service")
        self.page.close()

    def action(self, name):
        self.page.locator('[data-action="' + name + '"]').click()

    def tools(self):
        options=self.page.locator(".demo-options")
        if not options.evaluate("(el) => el.open"):
            options.locator("summary").click()

    def advance(self):
        self.tools()
        self.page.locator("#advance-time").click()

    def case(self, name):
        self.page.locator("#case-select").select_option(name)

    def staff(self):
        self.page.locator("#staff-tab").click()

    def message(self, text):
        self.page.locator("#chat-message").fill(text)
        self.page.locator("#message-form button").click()

    def fill_measurement(self):
        self.action("edit-measurement")
        self.page.locator("#measurement").fill("Tôi dùng ca có vạch 1 lít để đo tới mức tối đa của lòng nồi.")
        self.page.locator("#edit-form button[type=submit]").click()

    def ready_s04(self):
        self.case("S04")
        self.action("add-label")
        self.fill_measurement()
        self.action("transfer")
        self.staff()
        self.action("claim")
        self.action("seller-response")

    def open_decision(self, kind="refund"):
        self.page.locator("#resolution").select_option(kind)
        self.page.locator("#decision-reason").fill("Đã đối chiếu mô tả lúc đặt, bằng chứng người mua và phản hồi shop; xác nhận phương án xử lý trong hồ sơ mẫu.")
        self.page.locator("#review-check").check()
        self.page.locator("#prepare-decision").click()

    def test_01_source_unverified_blocks_decision(self):
        self.staff()
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.assertTrue(self.page.locator('[data-action="verify-source"]').is_disabled())
        self.action("claim")
        self.action("verify-source")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.action("seller-response")
        self.assertTrue(self.page.locator("#prepare-decision").is_enabled())

    def test_02_no_screenshot_still_goes_to_staff(self):
        self.action("no-screenshot")
        self.assertEqual(self.page.locator("#queue-count").inner_text(), "1")
        self.assertIn("không bắt buộc có ảnh", self.page.locator(".thread").inner_text())
        self.staff()
        self.assertEqual(self.page.locator('[data-action="claim"]').count(), 1)

    def test_03_screenshot_is_not_source_verification(self):
        self.action("add-screenshot")
        self.staff()
        self.action("claim")
        self.action("seller-response")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())

    def test_04_refund_needs_separate_impact_confirmation(self):
        self.case("S09")
        self.staff()
        self.action("claim")
        self.open_decision()
        self.assertTrue(self.page.locator("#decision-dialog").is_visible())
        self.assertTrue(self.page.locator("#confirm-decision").is_disabled())
        self.page.locator("#confirm-impact").check()
        self.page.locator("#confirm-decision").click()
        self.assertIn("hoàn tiền", self.page.locator(".review-amount").locator("..").inner_text())
        self.assertEqual(self.page.locator("#prepare-decision").count(), 0)
        self.page.locator("#buyer-tab").click()
        self.assertIn("Đã ghi nhận hoàn tiền 590.000", self.page.locator(".fund-status").inner_text())

    def test_05_escape_confirmation_has_no_financial_effect(self):
        self.case("S09")
        self.staff()
        self.action("claim")
        self.open_decision()
        self.page.keyboard.press("Escape")
        self.assertFalse(self.page.locator("#decision-dialog").is_visible())
        self.page.locator("#buyer-tab").click()
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())

    def test_06_s04_collects_context_before_decision(self):
        self.case("S04")
        self.staff()
        self.assertIn("Chưa có hồ sơ", self.page.locator("#app").inner_text())
        self.page.locator("#buyer-tab").click()
        self.action("add-label")
        self.action("transfer")
        self.staff()
        self.action("claim")
        self.action("seller-response")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.page.locator("#buyer-tab").click()
        self.fill_measurement()
        self.staff()
        self.assertTrue(self.page.locator("#prepare-decision").is_enabled())

    def test_07_deny_is_a_separate_confirmed_decision(self):
        self.ready_s04()
        self.open_decision("deny")
        self.assertIn("tiền về người bán", self.page.locator("#decision-summary").inner_text())
        self.page.locator("#confirm-impact").check()
        self.page.locator("#confirm-decision").click()
        self.page.locator("#buyer-tab").click()
        self.assertIn("Đã đóng khiếu nại", self.page.locator(".fund-status").inner_text())

    def test_08_rejecting_draft_does_not_close_complaint(self):
        self.case("S09")
        self.staff()
        self.action("claim")
        self.action("reject-draft")
        self.assertEqual(self.page.locator("#prepare-decision").count(), 1)
        self.page.locator("#buyer-tab").click()
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())
        self.assertIn("khiếu nại vẫn mở", self.page.locator(".thread").inner_text().lower())

    def test_09_transfer_can_be_undone_before_staff_acceptance(self):
        self.case("S04")
        self.action("transfer")
        self.action("undo-transfer")
        self.assertEqual(self.page.locator("#queue-count").inner_text(), "0")
        self.staff()
        self.assertIn("Chưa có hồ sơ", self.page.locator("#app").inner_text())

    def test_10_accepted_transfer_cannot_be_recalled(self):
        self.case("S04")
        self.action("transfer")
        self.staff()
        self.action("claim")
        self.page.locator("#buyer-tab").click()
        self.assertEqual(self.page.locator('[data-action="undo-transfer"]').count(), 0)

    def test_11_overdue_review_never_auto_resolves_money(self):
        self.advance()
        self.assertIn("Đang trễ", self.page.locator(".action-area").inner_text())
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())

    def test_12_48h_silence_escalates_instead_of_denying(self):
        self.case("S04")
        self.advance()
        self.assertEqual(self.page.locator("#queue-count").inner_text(), "0")
        self.advance()
        self.assertEqual(self.page.locator("#queue-count").inner_text(), "1")
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())
        self.advance()
        self.assertEqual(self.page.locator(".bubble").filter(has_text="Mình nhắc lại một lần").count(), 1)

    def test_13_threats_do_not_trigger_refund(self):
        self.message("Tôi sẽ bóc phốt, phải hoàn tiền ngay!")
        self.assertIn("Lời gây áp lực không thay thế căn cứ", self.page.locator(".thread").inner_text())
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())

    def test_14_no_shop_penalty_action(self):
        self.message("Khóa shop vì hàng giả ngay!")
        self.staff()
        self.action("claim")
        self.action("verify-source")
        self.action("seller-response")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.assertEqual(self.page.get_by_role("button", name="Phạt shop", exact=True).count(), 0)

    def test_15_private_contact_request_is_refused(self):
        self.message("Cho tôi số điện thoại và địa chỉ của shop.")
        self.assertIn("không cung cấp thông tin liên hệ", self.page.locator(".thread").inner_text())
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())

    def test_16_unknown_input_has_a_safe_fallback(self):
        self.message("Vụ hôm qua ấy, giải quyết đi.")
        self.assertIn("chưa đủ thông tin", self.page.locator(".thread").inner_text())
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())

    def test_17_user_text_is_escaped(self):
        self.page.evaluate("window.xssExecuted = false")
        self.message('<img src=x onerror="window.xssExecuted=true">')
        self.assertFalse(self.page.evaluate("window.xssExecuted"))
        self.assertEqual(self.page.locator(".thread img").count(), 0)

    def test_18_normal_case_does_not_repeat_evidence_request(self):
        self.case("S09")
        self.assertIn("không cần gửi lại", self.page.locator(".thread").inner_text())
        self.assertEqual(self.page.locator('[data-action="add-label"]').count(), 0)
        self.staff()
        self.action("claim")
        self.assertTrue(self.page.locator("#prepare-decision").is_enabled())

    def test_19_bounded_evidence_requests(self):
        self.ready_s04()
        self.action("ask-more")
        self.action("ask-more")
        self.page.get_by_text("Shop được thông báo những gì?", exact=True).click()
        self.assertIn("Yêu cầu gửi shop: 1/1", self.page.locator("#app").inner_text())

    def test_20_mobile_layout_and_dialog(self):
        self.page.set_viewport_size({"width":390,"height":844})
        for name in ["S01","S04","S09"]:
            self.case(name)
            self.assertFalse(self.page.evaluate("document.documentElement.scrollWidth > innerWidth"))
        self.staff()
        self.action("claim")
        self.open_decision()
        self.assertFalse(self.page.evaluate("document.documentElement.scrollWidth > innerWidth"))
        self.assertTrue(self.page.locator("#decision-dialog").is_visible())

    def test_21_correction_invalidates_draft(self):
        self.case("S09")
        self.message("Đính chính, thông tin tôi gửi sai rồi.")
        self.staff()
        self.action("claim")
        self.assertEqual(self.page.locator('[data-action="undo-draft"]').count(), 0)


    def test_22_s01_cancelled_decision_keeps_money_unchanged(self):
        self.staff()
        self.action("claim")
        self.action("verify-source")
        self.action("seller-response")
        self.open_decision()
        self.assertTrue(self.page.locator("#confirm-decision").is_disabled())
        self.page.get_by_role("button", name="Quay lại kiểm tra", exact=True).click()
        self.page.locator("#buyer-tab").click()
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())

    def test_23_s04_cancelled_decision_keeps_money_unchanged(self):
        self.ready_s04()
        self.open_decision()
        self.assertTrue(self.page.locator("#confirm-decision").is_disabled())
        self.page.get_by_role("button", name="Quay lại kiểm tra", exact=True).click()
        self.page.locator("#buyer-tab").click()
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())


def capture():
    out = ROOT / "prototype" / "screenshots"
    out.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(channel="msedge", headless=True)
        page = b.new_page(viewport={"width":1440,"height":1100}, device_scale_factor=1)
        page.goto(PAGE)
        page.locator(".demo-options > summary").click()
        page.locator("#annotations").check()
        page.locator(".demo-options > summary").click()
        page.screenshot(path=str(out / "01-nguoi-mua.jpg"), full_page=True, type="jpeg", quality=82)
        page.locator("#case-select").select_option("S04")
        page.locator('[data-action="add-label"]').click()
        page.locator('[data-action="edit-measurement"]').click()
        page.locator("#measurement").fill("Tôi dùng ca có vạch để đong đến mức tối đa của lòng nồi.")
        page.locator("#edit-form button[type=submit]").click()
        page.locator('[data-action="transfer"]').click()
        page.locator("#staff-tab").click()
        page.locator('[data-action="claim"]').click()
        page.locator('[data-action="seller-response"]').click()
        page.locator("#decision-reason").fill("Đã xem xét mô tả, ảnh nhãn và phản hồi cả hai phía; phương án xử lý được trưởng nhóm xác nhận trong hồ sơ mẫu.")
        page.locator("#review-check").check()
        page.locator("#prepare-decision").click()
        page.screenshot(path=str(out / "02-truong-nhom.jpg"), full_page=False, type="jpeg", quality=82)
        b.close()

if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(PrototypeChecks)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {"tests":result.testsRun, "failures":len(result.failures), "errors":len(result.errors),
              "browser":"Microsoft Edge / Playwright", "mode":"file://, no backend or external API"}
    (ROOT / "prototype" / "test-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    if result.wasSuccessful():
        capture()
    raise SystemExit(0 if result.wasSuccessful() else 1)
