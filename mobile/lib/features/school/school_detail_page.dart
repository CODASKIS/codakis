import 'package:flutter/material.dart';
import '../../widgets/codakis_logo_loader.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_card.dart';
import '../../widgets/codakis_primary_button.dart';
import 'school_service.dart';

class SchoolDetailPage extends StatefulWidget {
  const SchoolDetailPage({
    super.key,
    required this.schoolId,
    required this.schoolService,
  });

  final String schoolId;
  final SchoolService schoolService;

  @override
  State<SchoolDetailPage> createState() => _SchoolDetailPageState();
}

class _SchoolDetailPageState extends State<SchoolDetailPage> {
  late Future<DrivingSchoolDetail> _future;
  bool _enrolling = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    _future = widget.schoolService.fetchSchool(widget.schoolId);
  }

  Future<void> _enroll(SchoolForfait forfait) async {
    final s = LocaleScope.stringsOf(context);
    setState(() {
      _enrolling = true;
      _message = null;
    });
    try {
      await widget.schoolService.enroll(
        autoEcoleId: widget.schoolId,
        forfaitId: forfait.id,
      );
      if (!mounted) return;
      setState(() => _message = s.schoolEnrolled);
    } catch (err) {
      setState(() => _message = '$err');
    } finally {
      if (mounted) setState(() => _enrolling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);
    final isEnglish = LocaleScope.serviceOf(context).isEnglish;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(s.tabSchoolTitle),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textDark,
        elevation: 0.3,
      ),
      body: FutureBuilder<DrivingSchoolDetail>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CodakisLogoLoader());
          }
          if (snapshot.hasError) {
            return Center(child: Text('${snapshot.error}'));
          }
          final school = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              CodakisCard(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.gray),
                      ),
                      child: const Icon(Icons.storefront_outlined, size: 36, color: CodakisColors.primary),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(school.name, style: GoogleFonts.nunito(fontSize: 20, fontWeight: FontWeight.w800)),
                          const SizedBox(height: 4),
                          Text('${school.city} · ${school.address}', style: GoogleFonts.nunito(color: AppColors.placeholder)),
                          if (school.phone != null) Text(school.phone!, style: GoogleFonts.nunito(color: AppColors.placeholder)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              if (school.description != null) ...[
                const SizedBox(height: 12),
                CodakisCard(child: Text(school.description!, style: GoogleFonts.nunito(height: 1.5))),
              ],
              if (_message != null) ...[
                const SizedBox(height: 12),
                Text(
                  _message!,
                  style: TextStyle(
                    color: _message == s.schoolEnrolled ? AppColors.primary : AppColors.error,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
              const SizedBox(height: 20),
              Text(s.schoolForfaitsTitle, style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              ...school.forfaits.map((forfait) {
                final label = isEnglish && forfait.labelEn.isNotEmpty ? forfait.labelEn : forfait.labelFr;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: CodakisCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(label, style: GoogleFonts.nunito(fontWeight: FontWeight.w800, fontSize: 17)),
                        if (forfait.descriptionFr != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(forfait.descriptionFr!, style: GoogleFonts.nunito(color: AppColors.placeholder)),
                          ),
                        const SizedBox(height: 8),
                        Text(s.schoolForfaitPrice(forfait.prix), style: GoogleFonts.nunito(fontWeight: FontWeight.w700, color: CodakisColors.primary)),
                        const SizedBox(height: 12),
                        CodakisPrimaryButton(
                          label: _enrolling ? s.schoolEnrolling : s.schoolEnrollCta,
                          expand: true,
                          loading: _enrolling,
                          variant: CodakisButtonVariant.site,
                          size: CodakisButtonSize.lg,
                          onPressed: _enrolling ? null : () => _enroll(forfait),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
