"""Focused regressions for the three added flows; keeps the original §6 report separate."""
import json,unittest
from browser_check import PrototypeChecks,ROOT

class FlowRegressions(PrototypeChecks):
    def ready_s01(self):
        self.staff()
        for name in ["claim","verify-source","seller-response"]:
            self.action(name)
        self.assertTrue(self.page.locator("#prepare-decision").is_enabled())

    def test_24_unknown_order_correction_locks_decision(self):
        self.ready_s01()
        self.page.locator("#buyer-tab").click()
        self.message("Đính chính, ảnh tôi gửi thuộc đơn khác. Mã đơn đúng là SP999999.")
        self.staff()
        self.assertIn("SP999999",self.page.locator(".correction-note").inner_text())
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.assertTrue(self.page.locator('[data-action="verify-source"]').is_disabled())
        self.assertIn("Chưa có quyết định",self.page.locator("#app").inner_text())

    def test_25_known_order_requires_complete_recheck(self):
        self.ready_s01()
        self.page.locator("#buyer-tab").click()
        self.message("Đính chính, thông tin ảnh trong hồ sơ này cần kiểm tra lại.")
        self.staff()
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.action("verify-source")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.action("seller-response")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.action("review-correction")
        self.assertTrue(self.page.locator("#prepare-decision").is_enabled())

    def test_26_pending_decision_is_invalidated_by_correction(self):
        self.case("S09")
        self.staff()
        self.action("claim")
        self.open_decision()
        self.page.locator("#confirm-impact").check()
        self.page.evaluate("""() => {
            document.querySelector('#buyer-tab').click();
            document.querySelector('#chat-message').value='Đính chính, ảnh thuộc đơn khác SP999999.';
            document.querySelector('#message-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
        }""")
        self.assertFalse(self.page.locator("#decision-dialog").is_visible())
        self.page.evaluate("document.querySelector('#confirm-decision').click()")
        self.assertIn("Chưa có quyết định",self.page.locator(".fund-status").inner_text())
        self.staff()
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())

    def test_27_correction_is_visible_and_escaped_in_staff_record(self):
        self.page.evaluate("window.correctionXss=false")
        self.message('Đính chính: <img src=x onerror="window.correctionXss=true"> cần xem lại ảnh.')
        self.staff()
        self.action("claim")
        self.assertIn("<img",self.page.locator(".correction-note").inner_text())
        self.assertEqual(self.page.locator(".correction-note img").count(),0)
        self.assertFalse(self.page.evaluate("window.correctionXss"))

    def test_28_s01_reminder_is_optional_and_sent_once(self):
        self.advance()
        self.assertEqual(self.page.locator(".bubble").filter(has_text="nếu còn ảnh chụp lúc đặt").count(),1)
        self.advance()
        self.assertEqual(self.page.locator(".bubble").filter(has_text="nếu còn ảnh chụp lúc đặt").count(),1)
        self.assertEqual(self.page.locator("#queue-count").inner_text(),"1")
        self.assertIn("Chưa có quyết định",self.page.locator(".fund-status").inner_text())

    def test_29_s01_no_image_reply_suppresses_unhelpful_reminder(self):
        self.action("no-screenshot")
        self.advance()
        self.assertEqual(self.page.locator(".bubble").filter(has_text="nếu còn ảnh chụp lúc đặt").count(),0)
        self.assertEqual(self.page.locator("#queue-count").inner_text(),"1")

    def test_30_s04_conflict_auto_transfers_without_customer_click(self):
        self.case("S04")
        self.action("add-label")
        self.fill_measurement()
        self.assertEqual(self.page.locator("#queue-count").inner_text(),"0")
        self.tools()
        self.page.locator("#simulate-conflict").click()
        self.assertEqual(self.page.locator("#queue-count").inner_text(),"1")
        self.assertEqual(self.page.locator('[data-action="undo-transfer"]').count(),0)
        self.staff()
        self.assertIn("Shop gửi thông số mẫu",self.page.locator("#app").inner_text())
        self.assertIn("6L",self.page.locator("#app").inner_text())
        self.assertIn("5L",self.page.locator("#app").inner_text())
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.action("claim")
        self.assertTrue(self.page.locator("#prepare-decision").is_enabled())

    def test_31_s04_conflict_with_missing_context_keeps_approval_locked(self):
        self.case("S04")
        self.tools()
        self.page.locator("#simulate-conflict").click()
        self.staff()
        self.action("claim")
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())

    def test_32_conflict_simulation_is_idempotent(self):
        self.case("S04")
        self.tools()
        self.page.locator("#simulate-conflict").click()
        self.assertTrue(self.page.locator("#simulate-conflict").is_disabled())
        self.page.evaluate("document.querySelector('#simulate-conflict').click()")
        self.staff()
        transfers=self.page.locator(".audit li").all_text_contents()
        self.assertEqual(sum("Chuyển trưởng nhóm:" in x for x in transfers),1)

    def test_33_known_order_can_be_restored_but_needs_reverification(self):
        self.ready_s01()
        self.page.locator("#buyer-tab").click()
        self.message("Đính chính mã đơn là SP999999.")
        self.message("Đính chính lại mã đơn đúng là SP20261108001.")
        self.staff()
        self.assertTrue(self.page.locator("#prepare-decision").is_disabled())
        self.assertFalse(self.page.locator('[data-action="verify-source"]').is_disabled())
        self.action("verify-source")
        self.action("seller-response")
        self.action("review-correction")
        self.assertTrue(self.page.locator("#prepare-decision").is_enabled())

if __name__=="__main__":
    names=sorted(name for name in FlowRegressions.__dict__ if name.startswith("test_"))
    result=unittest.TextTestRunner(verbosity=2).run(unittest.TestSuite(FlowRegressions(name) for name in names))
    report={"tests":result.testsRun,"failures":len(result.failures),"errors":len(result.errors),
            "scope":"correction re-verification, S01 reminder, S04 conflict handoff",
            "browser":"Microsoft Edge / Playwright","cases":names}
    (ROOT/"prototype/test-results-update.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    raise SystemExit(0 if result.wasSuccessful() else 1)
