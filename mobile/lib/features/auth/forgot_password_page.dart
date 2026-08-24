import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_auth_shell.dart';
import '../../widgets/codakis_logo.dart';
import '../../widgets/codakis_primary_button.dart';
import '../../widgets/codakis_text_field.dart';
import 'auth_service.dart';
import 'reset_password_page.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key, required this.authService});

  final AuthService authService;

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _success;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
      _success = null;
    });
    try {
      final message = await widget.authService.forgotPassword(_emailController.text);
      if (!mounted) return;
      setState(() => _success = message);
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ResetPasswordPage(
            authService: widget.authService,
            email: _emailController.text.trim(),
          ),
        ),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Center(child: CodakisLogo(height: 48)),
            const SizedBox(height: 16),
            Text(s.forgotTitle, style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(s.forgotLead, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            CodakisTextField(
              label: s.fieldEmail,
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              validator: (v) => v == null || !v.contains('@') ? s.validationEmailInvalid : null,
            ),
            const SizedBox(height: 16),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!, style: const TextStyle(color: CodakisColors.accentRed)),
            ],
            if (_success != null) ...[
              const SizedBox(height: 16),
              Text(_success!, style: const TextStyle(color: CodakisColors.primary)),
            ],
            const SizedBox(height: 24),
            CodakisPrimaryButton(
              label: _loading ? s.forgotSubmitting : s.forgotSubmit,
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
