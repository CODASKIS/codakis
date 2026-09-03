import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_auth_form.dart';
import '../../widgets/codakis_auth_shell.dart';
import '../../widgets/codakis_otp_form.dart';
import '../../widgets/codakis_primary_button.dart';
import 'auth_service.dart';
import 'login_page.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({
    super.key,
    required this.authService,
    required this.email,
  });

  final AuthService authService;
  final String email;

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _otpKey = GlobalKey<CodakisOtpFormState>();
  final _passwordController = TextEditingController();
  String _otp = '';
  bool _loading = false;
  bool _showPassword = false;
  String? _error;

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final otpState = _otpKey.currentState;
    if (otpState == null || !otpState.validate()) {
      setState(() => _error = LocaleScope.stringsOf(context).validationOtpRequired);
      return;
    }
    _otp = otpState.value;
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.authService.resetPassword(
        email: widget.email,
        otp: _otp,
        newPassword: _passwordController.text,
      );
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => LoginPage(authService: widget.authService)),
        (_) => false,
      );
    } catch (err) {
      setState(() => _error = err.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return CodakisAuthShell(
      child: Form(
        key: _formKey,
        child: CodakisLogoTitleLayout(
          title: s.verificationTitle,
          subtitle: s.verificationLead,
          logoHeight: 64,
          children: [
            Text(
              widget.email,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: CodakisColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            SizedBox(height: MediaQuery.sizeOf(context).height * 0.04),
            CodakisOtpForm(
              key: _otpKey,
              length: 6,
              onCompleted: (code) => _otp = code,
            ),
            const SizedBox(height: 24),
            CodakisSoftField(
              controller: _passwordController,
              hintText: s.fieldNewPassword,
              obscureText: !_showPassword,
              suffixIcon: IconButton(
                icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                onPressed: () => setState(() => _showPassword = !_showPassword),
              ),
              validator: (v) => v == null || v.length < 8 ? s.validationPasswordMin : null,
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: CodakisColors.accentRed)),
            ],
            const SizedBox(height: 24),
            CodakisPrimaryButton(
              label: _loading ? s.resetSubmitting : s.verificationNext,
              loading: _loading,
              expand: true,
              onPressed: _loading ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}
