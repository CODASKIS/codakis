import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_card.dart';
import '../../widgets/codakis_primary_button.dart';
import '../../widgets/codakis_text_field.dart';
import 'school_detail_page.dart';
import 'school_service.dart';

class SchoolPage extends StatefulWidget {
  const SchoolPage({super.key, required this.schoolService});

  final SchoolService schoolService;

  @override
  State<SchoolPage> createState() => _SchoolPageState();
}

class _SchoolPageState extends State<SchoolPage> {
  final _searchController = TextEditingController();
  late Future<List<DrivingSchool>> _schoolsFuture;
  late Future<List<CandidatInscription>> _inscriptionsFuture;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _reload() {
    _schoolsFuture = widget.schoolService.fetchSchools(query: _searchController.text.trim());
    _inscriptionsFuture = widget.schoolService.fetchMyInscriptions();
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(s.tabSchoolTitle),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textDark,
        elevation: 0.3,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(_reload);
          await Future.wait([_schoolsFuture, _inscriptionsFuture]);
        },
        color: CodakisColors.primary,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            CodakisTextField(
              hintText: s.schoolSearchHint,
              controller: _searchController,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => setState(_reload),
              prefixIcon: const Padding(
                padding: EdgeInsets.only(left: 12, right: 4),
                child: Icon(Icons.search, size: 20),
              ),
            ),
            const SizedBox(height: 20),
            Text(s.schoolMyEnrollments, style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            FutureBuilder<List<CandidatInscription>>(
              future: _inscriptionsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
                }
                final items = snapshot.data ?? [];
                if (items.isEmpty) {
                  return CodakisCard(
                    child: Column(
                      children: [
                        Icon(Icons.directions_car_outlined, size: 48, color: CodakisColors.primary.withValues(alpha: 0.7)),
                        const SizedBox(height: 12),
                        Text(s.schoolNoEnrollment, textAlign: TextAlign.center, style: GoogleFonts.nunito(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 6),
                        Text(
                          s.schoolBrowseTitle,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.nunito(fontSize: 13, color: AppColors.placeholder),
                        ),
                      ],
                    ),
                  );
                }
                return Column(
                  children: items
                      .map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: CodakisCard(
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: CodakisColors.surfaceAlt,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.directions_car, color: CodakisColors.primary),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item.schoolName, style: GoogleFonts.nunito(fontWeight: FontWeight.w700)),
                                      Text('${item.forfaitLabel} · ${item.statut}', style: GoogleFonts.nunito(fontSize: 13, color: AppColors.placeholder)),
                                    ],
                                  ),
                                ),
                                Text(
                                  s.schoolHoursLeft(item.heuresRestantes, item.heuresTotal),
                                  style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w700, color: CodakisColors.primary),
                                ),
                              ],
                            ),
                          ),
                        ),
                      )
                      .toList(),
                );
              },
            ),
            const SizedBox(height: 20),
            Text(s.schoolBrowseTitle, style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            FutureBuilder<List<DrivingSchool>>(
              future: _schoolsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
                }
                if (snapshot.hasError) {
                  return CodakisCard(
                    child: Column(
                      children: [
                        Text('${snapshot.error}'),
                        const SizedBox(height: 12),
                        CodakisPrimaryButton(
                          label: s.commonRetry,
                          expand: true,
                          variant: CodakisButtonVariant.site,
                          onPressed: () => setState(_reload),
                        ),
                      ],
                    ),
                  );
                }
                final schools = snapshot.data ?? [];
                if (schools.isEmpty) {
                  return CodakisCard(child: Text(s.schoolEmpty));
                }
                return Column(
                  children: schools
                      .map(
                        (school) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: CodakisCard(
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => SchoolDetailPage(
                                  schoolId: school.id,
                                  schoolService: widget.schoolService,
                                ),
                              ),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 72,
                                  height: 72,
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceMuted,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: AppColors.gray),
                                  ),
                                  child: const Icon(Icons.storefront_outlined, color: CodakisColors.primary, size: 32),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(school.name, style: GoogleFonts.nunito(fontWeight: FontWeight.w800, fontSize: 16)),
                                      const SizedBox(height: 4),
                                      Text(
                                        school.city,
                                        style: GoogleFonts.nunito(fontSize: 13, color: AppColors.placeholder),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        s.schoolFromPrice(school.priceFrom),
                                        style: GoogleFonts.nunito(fontWeight: FontWeight.w700, color: CodakisColors.primary),
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.chevron_right, color: AppColors.placeholder),
                              ],
                            ),
                          ),
                        ),
                      )
                      .toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
