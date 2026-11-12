"""Completion evidence for S01 decisions and a late correction rehearsal."""
import json
import unittest
from browser_check import PrototypeChecks, ROOT

class CompletionChecks(PrototypeChecks):
    def ready_s01(self):
        self.staff()
        self.action("claim")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.action("verify-source")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.action("seller-response")
        self.assertTrue(self.page.locator("#prepare-decision").is_enabled())

    def complete_s01(self, kind, expected):
        self.ready_s01()
        self.open_decision(kind)
        summary = self.page.locator("#decision-summary").inner_text()
        self.assertIn("SP20261108001", summary)
        self.assertIn("590.000", summary)
        self.assertIn("Lý do:", summary)
        self.assertIn("Tiền hoàn về người mua" if kind == "refund" else "tiền về người bán", summary)
        self.assertTrue(self.page.locator("#confirm-decision").is_disabled())
        self.page.locator("#confirm-impact").check()
        self.page.locator("#confirm-decision").click()
        self.assertFalse(self.page.locator("#decision-dialog").is_visible())
        self.assertEqual(self.page.locator("#prepare-decision").count(), 0)
        self.page.locator("#buyer-tab").click()
        self.assertIn(expected, self.page.locator(".fund-status").inner_text())

    def test_34_s01_refund_completes_only_after_review_and_confirmation(self):
        self.complete_s01("refund", "Đã ghi nhận hoàn tiền 590.000")

    def test_35_s01_denial_completes_only_after_review_and_confirmation(self):
        self.complete_s01("deny", "Đã đóng khiếu nại")

    def test_36_late_wrong_order_correction_remains_blocked_after_timeout(self):
        self.case("S09")
        self.staff()
        self.action("claim")
        self.open_decision()
        self.page.get_by_role("button", name="Quay lại kiểm tra", exact=True).click()
        self.page.locator("#buyer-tab").click()
        self.message("Đính chính: shop đã nhận gửi nhầm, nhưng ảnh tôi gửi thuộc đơn khác. Mã đơn đúng là SP999999.")
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())
        self.staff()
        self.assertIn("SP999999", self.page.locator(".correction-note").inner_text())
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.assertTrue(self.page.locator('[data-action="verify-source"]').is_disabled())
        self.advance()
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.page.locator("#buyer-tab").click()
        self.assertIn("Chưa có quyết định", self.page.locator(".fund-status").inner_text())
        self.assertEqual(self.page.locator("#queue-count").inner_text(), "1")

if __name__ == "__main__":
    names = sorted(name for name in CompletionChecks.__dict__ if name.startswith("test_"))
    result = unittest.TextTestRunner(verbosity=2).run(unittest.TestSuite(CompletionChecks(name) for name in names))
    report = {"tests": result.testsRun, "failures": len(result.failures), "errors": len(result.errors),
              "browser": "Microsoft Edge / Playwright", "mode": "file://, mock data",
              "scope": "S01 confirmed refund and denial; S09 wrong-order correction before decision, including timeout",
              "cases": names}
    (ROOT / "prototype/test-results-completion.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    raise SystemExit(0 if result.wasSuccessful() else 1)