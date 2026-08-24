import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_card.dart';
import '../../widgets/codakis_form_feedback.dart';
import '../../widgets/codakis_language_picker.dart';
import '../../widgets/codakis_outline_button.dart';
import '../../widgets/codakis_primary_button.dart';
import '../../widgets/codakis_text_field.dart';
import 'profile_service.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({
    super.key,
    required this.onLogout,
    required this.profileService,
    required this.onOpenCourses,
    required this.onOpenQuizzes,
    required this.onOpenSchool,
    required this.onOpenConsort,
  });

  final VoidCallback onLogout;
  final ProfileService profileService;
  final VoidCallback onOpenCourses;
  final VoidCallback onOpenQuizzes;
  final VoidCallback onOpenSchool;
  final VoidCallback onOpenConsort;

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late Future<UserProfile> _future;
  final _email = TextEditingController();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _phone = TextEditingController();
  final _city = TextEditingController();
  bool _saving = false;
  String? _message;
  UserProfile? _profile;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  @override
  void dispose() {
    _email.dispose();
    _firstName.dispose();
    _lastName.dispose();
    _phone.dispose();
    _city.dispose();
    super.dispose();
  }

  void _applyProfile(UserProfile profile) {
    _profile = profile;
    _email.text = profile.email;
    _firstName.text = profile.firstName;
    _lastName.text = profile.lastName;
    _phone.text = profile.phone ?? '';
    _city.text = profile.city ?? '';
  }

  void _reload() {
    setState(() {
      _message = null;
      _future = widget.profileService.fetchMe().then((profile) {
        _applyProfile(profile);
        return profile;
      });
    });
  }

  Future<void> _save() async {
    final s = LocaleScope.stringsOf(context);
    setState(() {
      _saving = true;
      _message = null;
    });
    try {
      final updated = await widget.profileService.updateMe(
        firstName: _firstName.text.trim(),
        lastName: _lastName.text.trim(),
        phone: _phone.text.trim(),
        city: _city.text.trim(),
        langue: LocaleScope.serviceOf(context).locale,
      );
      if (!mounted) return;
      setState(() {
        _applyProfile(updated);
        _message = s.profileSaved;
      });
    } catch (err) {
      setState(() => _message = '$err');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(s.profileTitle),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textDark,
        elevation: 0.3,
        actions: [
          IconButton(onPressed: _reload, icon: const Icon(Icons.refresh), tooltip: s.commonRetry),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          _reload();
          await _future;
        },
        color: CodakisColors.primary,
        child: FutureBuilder<UserProfile>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting && _profile == null) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [SizedBox(height: 120), Center(child: CircularProgressIndicator())],
              );
            }

            final profile = snapshot.data ?? _profile;

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              children: [
                CodakisCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: CodakisColors.primary.withValues(alpha: 0.12),
                            child: Text(
                              profile?.initials ?? '?',
                              style: GoogleFonts.nunito(
                                color: CodakisColors.primary,
                                fontWeight: FontWeight.w800,
                                fontSize: 18,
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  profile?.fullName ?? s.profileLead,
                                  style: GoogleFonts.nunito(fontSize: 18, fontWeight: FontWeight.w800),
                                ),
                                Text(profile?.email ?? '', style: GoogleFonts.nunito(color: AppColors.placeholder)),
                                if (profile?.plan != null)
                                  Text(
                                    s.profilePlan(profile!.plan!),
                                    style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w600),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                CodakisCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(s.profileEditTitle, style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 16),
                      CodakisTextField(label: s.fieldEmail, controller: _email, readOnly: true),
                      const SizedBox(height: 12),
                      CodakisTextField(label: s.fieldFirstName, controller: _firstName),
                      const SizedBox(height: 12),
                      CodakisTextField(label: s.fieldLastName, controller: _lastName),
                      const SizedBox(height: 12),
                      CodakisTextField(label: s.fieldPhone, controller: _phone, keyboardType: TextInputType.phone),
                      const SizedBox(height: 12),
                      CodakisTextField(label: s.fieldCity, controller: _city),
                      const SizedBox(height: 12),
                      CodakisCard(
                        padding: EdgeInsets.zero,
                        onTap: () {
                          final localeService = LocaleScope.serviceOf(context);
                          CodakisLanguagePickerSheet.show(
                            context,
                            options: codakisLanguageOptions(s),
                            initialCode: localeService.locale,
                            onSaved: (code) async {
                              await localeService.setLocale(code);
                              if (_saving) return;
                              await _save();
                            },
                          );
                        },
                        child: ListTile(
                          leading: const Icon(Icons.language, color: CodakisColors.primary),
                          title: Text(s.fieldLanguage, style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text(
                            LocaleScope.serviceOf(context).isEnglish ? s.authLanguageEn : s.authLanguageFr,
                          ),
                          trailing: const Icon(Icons.chevron_right, color: AppColors.placeholder),
                        ),
                      ),
                      if (_message != null) ...[
                        const SizedBox(height: 12),
                        _message == s.profileSaved
                            ? CodakisFormFeedback.success(message: _message!)
                            : CodakisFormFeedback.error(message: _message!),
                      ],
                      const SizedBox(height: 16),
                      CodakisPrimaryButton(
                        label: _saving ? s.profileSaving : s.profileSave,
                        expand: true,
                        loading: _saving,
                        variant: CodakisButtonVariant.site,
                        onPressed: _saving ? null : _save,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _ShortcutCard(icon: Icons.menu_book_outlined, label: s.navCourses, onTap: widget.onOpenCourses),
                _ShortcutCard(icon: Icons.quiz_outlined, label: s.navQuizzes, onTap: widget.onOpenQuizzes),
                _ShortcutCard(icon: Icons.directions_car_outlined, label: s.navSchool, onTap: widget.onOpenSchool),
                _ShortcutCard(icon: Icons.folder_open_outlined, label: s.consortNavLabel, onTap: widget.onOpenConsort),
                const SizedBox(height: 8),
                CodakisOutlineButton(label: s.profileLogout, expand: true, onPressed: widget.onLogout),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ShortcutCard extends StatelessWidget {
  const _ShortcutCard({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: CodakisCard(
        padding: EdgeInsets.zero,
        onTap: onTap,
        child: ListTile(
          leading: Icon(icon, color: CodakisColors.primary),
          title: Text(label, style: GoogleFonts.nunito(fontWeight: FontWeight.w600)),
          trailing: const Icon(Icons.chevron_right, color: AppColors.placeholder),
        ),
      ),
    );
  }
}
