import 'package:flutter/material.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_form_feedback.dart';
import '../../widgets/codakis_logo.dart';
import '../../widgets/codakis_primary_button.dart';
import '../../widgets/codakis_text_field.dart';
import 'auth_service.dart';
import 'forgot_password_page.dart';
import 'register_page.dart';
import '../home/main_shell.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key, required this.authService});

  final AuthService authService;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'candidat@demo.codakis.cm');
  final _passwordController = TextEditingController(text: 'Demo123!');
  bool _loading = false;
  bool _showPassword = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final s = LocaleScope.stringsOf(context);
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.authService.login(
        email: _emailController.text,
        password: _passwordController.text,
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => MainShell(authService: widget.authService)),
      );
    } on ApiException catch (err) {
      setState(() => _error = err.message);
    } catch (_) {
      setState(() => _error = s.loginError);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                children: [
                  const CodakisLogo(height: 56),
                  const SizedBox(height: 12),
                  Text(
                    s.loginWelcomePrefix,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'CODAKIS',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: CodakisColors.primary,
                        ),
                  ),
                  Text(s.loginTagline, textAlign: TextAlign.center),
                  const SizedBox(height: 24),
                  Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        CodakisTextField(
                          label: s.fieldEmail,
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          validator: (v) => v == null || v.trim().isEmpty ? s.validationEmailRequired : null,
                        ),
                        const SizedBox(height: 12),
                        CodakisTextField(
                          label: s.fieldPassword,
                          controller: _passwordController,
                          obscureText: true,
                          showObscureToggle: true,
                          obscureVisible: _showPassword,
                          onToggleObscure: () => setState(() => _showPassword = !_showPassword),
                          textInputAction: TextInputAction.done,
                          validator: (v) => v == null || v.length < 8 ? s.validationPasswordInvalid : null,
                        ),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: _loading
                                ? null
                                : () => Navigator.of(context).push(
                                      MaterialPageRoute(builder: (_) => ForgotPasswordPage(authService: widget.authService)),
                                    ),
                            child: Text(s.loginForgot),
                          ),
                        ),
                        if (_error != null) ...[
                          CodakisFormFeedback.error(message: _error!),
                          const SizedBox(height: 12),
                        ],
                        CodakisPrimaryButton(
                          label: _loading ? s.loginSubmitting : s.loginSubmit,
                          expand: true,
                          loading: _loading,
                          variant: CodakisButtonVariant.auth,
                          onPressed: _loading ? null : _submit,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(s.registerHasAccount),
                            TextButton(
                              onPressed: _loading
                                  ? null
                                  : () => Navigator.of(context).push(
                                        MaterialPageRoute(builder: (_) => RegisterPage(authService: widget.authService)),
                                      ),
                              child: Text(s.registerSignIn),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
