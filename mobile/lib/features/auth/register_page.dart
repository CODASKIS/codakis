import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/locale_scope.dart';
import '../../data/cemac_countries.dart';
import '../../widgets/codakis_form_feedback.dart';
import '../../widgets/codakis_logo.dart';
import '../../widgets/codakis_primary_button.dart';
import '../../widgets/codakis_text_field.dart';
import '../home/main_shell.dart';
import 'auth_service.dart';
import 'login_page.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key, required this.authService});

  final AuthService authService;

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _showPassword = false;
  String _countryCode = 'CM';
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.authService.registerCandidat(
        email: _emailController.text,
        password: _passwordController.text,
        fullName: _nameController.text,
        phone: _phoneController.text,
        countryCode: _countryCode,
        langue: LocaleScope.serviceOf(context).locale,
      );
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => MainShell(authService: widget.authService)),
        (_) => false,
      );
    } catch (err) {
      setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);
    final isEnglish = LocaleScope.serviceOf(context).isEnglish;

    return Scaffold(
      backgroundColor: AppColors.scaffoldWithBoxBackground,
      appBar: AppBar(
        backgroundColor: AppColors.scaffoldWithBoxBackground,
        elevation: 0,
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              children: [
                const CodakisLogo(height: 48),
                const SizedBox(height: 8),
                Text(s.registerTitle, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: AppDefaults.padding),
                Container(
                  margin: const EdgeInsets.all(AppDefaults.margin),
                  padding: const EdgeInsets.all(AppDefaults.padding),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: AppDefaults.boxShadow,
                    borderRadius: AppDefaults.borderRadius,
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        CodakisTextField(
                          label: s.fieldFullName,
                          controller: _nameController,
                          validator: (v) => v == null || v.trim().length < 2 ? s.validationNameRequired : null,
                        ),
                        const SizedBox(height: 12),
                        CodakisTextField(
                          label: s.fieldEmail,
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          validator: (v) => v == null || !v.contains('@') ? s.validationEmailInvalid : null,
                        ),
                        const SizedBox(height: 12),
                        CodakisTextField(
                          label: s.fieldPhone,
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        CodakisTextField(
                          label: s.fieldPassword,
                          controller: _passwordController,
                          obscureText: true,
                          showObscureToggle: true,
                          obscureVisible: _showPassword,
                          onToggleObscure: () => setState(() => _showPassword = !_showPassword),
                          validator: (v) => v == null || v.length < 8 ? s.validationPasswordMin : null,
                        ),
                        const SizedBox(height: 12),
                        CodakisSelectField<String>(
                          label: s.fieldCountry,
                          value: _countryCode,
                          items: cemacCountries
                              .map((c) => DropdownMenuItem(value: c.code, child: Text(c.label(isEnglish))))
                              .toList(),
                          onChanged: (v) {
                            if (v != null) setState(() => _countryCode = v);
                          },
                        ),
                        if (_error != null) ...[
                          const SizedBox(height: 12),
                          CodakisFormFeedback.error(message: _error!),
                        ],
                        const SizedBox(height: AppDefaults.padding),
                        CodakisPrimaryButton(
                          label: _loading ? s.registerSubmitting : s.registerSubmit,
                          expand: true,
                          loading: _loading,
                          variant: CodakisButtonVariant.auth,
                          onPressed: _loading ? null : _submit,
                        ),
                        Center(
                          child: TextButton(
                            onPressed: () => Navigator.of(context).pushReplacement(
                              MaterialPageRoute(builder: (_) => LoginPage(authService: widget.authService)),
                            ),
                            child: Text('${s.registerHasAccount}${s.registerSignIn}'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
