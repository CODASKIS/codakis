import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../widgets/codakis_logo.dart';
import '../../widgets/codakis_primary_button.dart';
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: CodakisColors.textPrimary,
        elevation: 0,
        title: const Text('Mot de passe oublié'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(child: CodakisLogo(height: 48)),
                    const SizedBox(height: 16),
                    Text(
                      'Recevez un code par e-mail pour réinitialiser votre mot de passe.',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: 'E-mail'),
                      validator: (v) => v == null || !v.contains('@') ? 'E-mail invalide' : null,
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 16),
                      Text(_error!, style: TextStyle(color: CodakisColors.accentRed)),
                    ],
                    if (_success != null) ...[
                      const SizedBox(height: 16),
                      Text(_success!, style: TextStyle(color: CodakisColors.primary)),
                    ],
                    const SizedBox(height: 24),
                    CodakisPrimaryButton(
                      label: _loading ? 'Envoi…' : 'Envoyer le code',
                      loading: _loading,
                      expand: true,
                      onPressed: _loading ? null : _submit,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
