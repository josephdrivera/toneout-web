const LOGO_ROW = `
<tr>
  <td align="center" style="padding:0 0 36px;">
    <table cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#bf5a3a 0%,#4878a8 100%);text-align:center;vertical-align:middle;line-height:34px;">
          <span style="font-size:16px;color:#ffffff;">&#9836;</span>
        </td>
        <td style="padding-left:10px;font-size:18px;font-weight:700;color:#e4e5ed;letter-spacing:-0.5px;">
          ToneOut
        </td>
      </tr>
    </table>
  </td>
</tr>`;

const FOOTER = `
<tr>
  <td style="padding:32px 0 0;text-align:center;">
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
      <tr>
        <td style="padding:0 10px;">
          <a href="https://toneoutapp.com/privacy" style="font-size:11px;color:#3e3f50;text-decoration:none;">Privacy</a>
        </td>
        <td style="font-size:11px;color:#222330;">&middot;</td>
        <td style="padding:0 10px;">
          <a href="https://toneoutapp.com/terms" style="font-size:11px;color:#3e3f50;text-decoration:none;">Terms</a>
        </td>
        <td style="font-size:11px;color:#222330;">&middot;</td>
        <td style="padding:0 10px;">
          <a href="https://toneoutapp.com/support" style="font-size:11px;color:#3e3f50;text-decoration:none;">Support</a>
        </td>
      </tr>
    </table>
    <p style="margin:12px 0 0;font-size:11px;color:#2a2b38;">
      &copy; 2026 ToneOut. All rights reserved.
    </p>
  </td>
</tr>`;

function wrap(title: string, inner: string): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${title}</title>
  <!--[if mso]><style>table,td{font-family:Arial,sans-serif;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#08090e;font-family:-apple-system,'SF Pro Display','Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#08090e;">
    <tr>
      <td align="center" style="padding:48px 20px;">
        <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;width:100%;">
          ${LOGO_ROW}
          ${inner}
          ${FOOTER}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function buildWaitlistEmail(email: string): string {
  const card = `
<tr>
  <td style="background-color:#0f1018;border:1px solid #1a1b24;border-radius:16px;overflow:hidden;">

    <!-- Green accent bar -->
    <div style="height:3px;background:linear-gradient(90deg,#4d8a5c 0%,#4878a8 100%);"></div>

    <div style="padding:40px 32px 36px;">

      <!-- Checkmark -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <div style="width:56px;height:56px;border-radius:14px;background-color:rgba(77,138,92,0.1);border:1px solid rgba(77,138,92,0.15);line-height:56px;text-align:center;font-size:26px;color:#4d8a5c;">
              &#10003;
            </div>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 6px;font-size:22px;font-weight:800;color:#e4e5ed;text-align:center;letter-spacing:-0.5px;">
        You&rsquo;re on the waitlist
      </p>
      <p style="margin:0 0 28px;font-size:14px;color:#8a8b97;text-align:center;line-height:1.65;">
        Thanks for signing up. We&rsquo;ll send you <strong style="color:#d0d1da;">one email</strong> when<br />
        ToneOut is available on the App Store.
      </p>

      <!-- Divider -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
        <tr><td style="border-top:1px solid #1a1b24;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>

      <p style="margin:0 0 16px;font-size:10px;font-weight:700;color:#50515f;letter-spacing:0.12em;text-align:center;">
        WHAT YOU&rsquo;LL GET
      </p>

      <!-- Feature rows -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding:10px 16px;background-color:#111219;border:1px solid #16171f;border-radius:10px 10px 0 0;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="width:28px;height:28px;border-radius:7px;background-color:rgba(72,120,168,0.1);text-align:center;vertical-align:middle;line-height:28px;">
                  <span style="font-size:13px;">&#128225;</span>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:13px;font-weight:600;color:#d0d1da;">Live Scanner Feeds</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#50515f;">Police, fire &amp; EMS across the US</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px;background-color:#111219;border-left:1px solid #16171f;border-right:1px solid #16171f;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="width:28px;height:28px;border-radius:7px;background-color:rgba(191,90,58,0.1);text-align:center;vertical-align:middle;line-height:28px;">
                  <span style="font-size:13px;">&#127911;</span>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:13px;font-weight:600;color:#d0d1da;">Dual Listen</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#50515f;">Two live feeds at once with independent volume</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px;background-color:#111219;border-left:1px solid #16171f;border-right:1px solid #16171f;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="width:28px;height:28px;border-radius:7px;background-color:rgba(200,155,60,0.1);text-align:center;vertical-align:middle;line-height:28px;">
                  <span style="font-size:13px;">&#128227;</span>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:13px;font-weight:600;color:#d0d1da;">Push to Talk</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#50515f;">Walkie-talkie with your crew via Action Button</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px;background-color:#111219;border:1px solid #16171f;border-radius:0 0 10px 10px;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="width:28px;height:28px;border-radius:7px;background-color:rgba(77,138,92,0.1);text-align:center;vertical-align:middle;line-height:28px;">
                  <span style="font-size:13px;">&#10005;</span>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:13px;font-weight:600;color:#d0d1da;">No Ads. Ever.</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#50515f;">Clean, distraction-free listening</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Platform note -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;">
        <tr><td style="border-top:1px solid #1a1b24;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding-right:16px;text-align:center;">
                  <p style="margin:0 0 2px;font-size:11px;color:#50515f;">&#63743; iOS</p>
                  <p style="margin:0;font-size:10px;color:#4d8a5c;font-weight:600;">Coming Soon</p>
                </td>
                <td style="border-left:1px solid #1a1b24;padding-left:16px;text-align:center;">
                  <p style="margin:0 0 2px;font-size:11px;color:#50515f;"><img src="https://developer.android.com/static/images/brand/Android_Robot.png" alt="Android" width="12" height="12" style="display:inline-block;vertical-align:middle;margin-right:3px;" />Android</p>
                  <p style="margin:0;font-size:10px;color:#c89b3c;font-weight:600;">Later in 2026</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

    </div>
  </td>
</tr>

<!-- Sent-to note -->
<tr>
  <td style="padding:20px 0 0;text-align:center;">
    <p style="margin:0;font-size:11px;color:#3e3f50;line-height:1.5;">
      Sent to <span style="color:#50515f;">${email}</span> because you joined the ToneOut waitlist.
    </p>
  </td>
</tr>`;

  return wrap("Welcome to the ToneOut Waitlist", card);
}

export function buildAdminNotificationEmail(
  email: string,
  totalCount: number,
): string {
  const time = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const card = `
<tr>
  <td style="background-color:#0f1018;border:1px solid #1a1b24;border-radius:16px;overflow:hidden;">

    <!-- Fire accent bar -->
    <div style="height:3px;background:linear-gradient(90deg,#bf5a3a 0%,#c89b3c 100%);"></div>

    <div style="padding:36px 32px 32px;">

      <!-- Badge -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding-bottom:8px;">
            <div style="display:inline-block;background-color:rgba(191,90,58,0.1);border:1px solid rgba(191,90,58,0.15);border-radius:20px;padding:4px 14px;">
              <span style="font-size:10px;font-weight:700;color:#bf5a3a;letter-spacing:0.1em;">NEW SIGNUP</span>
            </div>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px;font-size:36px;font-weight:800;color:#e4e5ed;text-align:center;letter-spacing:-1px;">
        #${totalCount}
      </p>

      <!-- Detail card -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#111219;border:1px solid #16171f;border-radius:12px;">
        <tr>
          <td style="padding:16px 20px 12px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#3e3f50;letter-spacing:0.1em;">EMAIL</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#e4e5ed;">${email}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 20px;"><div style="border-top:1px solid #1a1b24;"></div></td>
        </tr>
        <tr>
          <td style="padding:12px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#3e3f50;letter-spacing:0.1em;">TIME</p>
                  <p style="margin:0;font-size:13px;color:#8a8b97;">${time} ET</p>
                </td>
                <td align="right">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#3e3f50;letter-spacing:0.1em;">TOTAL</p>
                  <p style="margin:0;font-size:13px;font-weight:700;color:#d0d1da;">${totalCount} signups</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Quick link -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;">
        <tr>
          <td align="center">
            <a href="https://dashboard.convex.dev" style="display:inline-block;background-color:#111219;border:1px solid #222330;border-radius:8px;padding:10px 20px;font-size:12px;font-weight:600;color:#4878a8;text-decoration:none;">
              View in Convex Dashboard &rarr;
            </a>
          </td>
        </tr>
      </table>

    </div>
  </td>
</tr>`;

  return wrap("New ToneOut Waitlist Signup", card);
}
