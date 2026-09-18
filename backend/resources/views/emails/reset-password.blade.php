<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation du mot de passe</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,.08);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:28px 32px;">
                            <span style="display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;border-radius:12px;background:rgba(255,255,255,.18);color:#fff;font-weight:bold;">GS</span>
                            <span style="color:#fff;font-size:18px;font-weight:bold;margin-left:12px;vertical-align:middle;">GS Stock</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a;">Réinitialisation du mot de passe</h1>
                            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
                                Bonjour {{ $userName }},
                            </p>
                            <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
                                Vous avez demandé la réinitialisation de votre mot de passe.
                                Cliquez sur le bouton ci-dessous pour en définir un nouveau.
                            </p>
                            <p style="text-align:center;margin:0 0 24px;">
                                <a href="{{ $resetUrl }}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:14px 28px;border-radius:10px;">
                                    Réinitialiser mon mot de passe
                                </a>
                            </p>
                            <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
                                Ce lien est valable <strong>{{ $expireMinutes }} minutes</strong>.
                                Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
                            </p>
                            <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">
                                Lien : {{ $resetUrl }}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f8fafc;padding:18px 32px;font-size:12px;color:#94a3b8;">
                            © {{ date('Y') }} GS Stock — Gestion de stock multi-boutique
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
