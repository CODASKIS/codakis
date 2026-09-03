import 'package:flutter/material.dart';
import '../../widgets/codakis_logo_loader.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/locale_scope.dart';
import '../../l10n/app_strings.dart';
import '../../widgets/codakis_card.dart';
import '../../widgets/codakis_form_feedback.dart';
import '../../widgets/codakis_module_segment_nav.dart';
import '../../widgets/codakis_outline_button.dart';
import '../../widgets/codakis_primary_button.dart';
import '../../widgets/codakis_status_badge.dart';
import 'consort_service.dart';

class ConsortPage extends StatefulWidget {
  const ConsortPage({super.key, required this.consortService});

  final ConsortService consortService;

  @override
  State<ConsortPage> createState() => _ConsortPageState();
}

class _ConsortPageState extends State<ConsortPage> {
  late Future<ConsortDossier> _future;
  String _activeKey = consortPieceKeys.first;
  String? _busyKey;
  String? _error;
  String? _success;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _future = widget.consortService.fetchDossier();
  }

  Future<void> _submit(String pieceKey) async {
    final s = LocaleScope.stringsOf(context);
    setState(() {
      _busyKey = pieceKey;
      _error = null;
      _success = null;
    });
    try {
      final dossier = await widget.consortService.submitPiece(pieceKey);
      if (!mounted) return;
      setState(() {
        _future = Future.value(dossier);
        _success = s.consortSubmitSuccess;
      });
    } catch (err) {
      setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _busyKey = null);
    }
  }

  ConsortPiece _piece(ConsortDossier dossier, String key) {
    return dossier.pieces.firstWhere(
      (p) => p.key == key,
      orElse: () => ConsortPiece(key: key, status: 'missing'),
    );
  }

  Color _statusColor(String status) => switch (status) {
        'validated' => CodakisColors.primary,
        'pending' => AppColors.warning,
        _ => AppColors.error,
      };

  IconData _statusIcon(String status) => switch (status) {
        'validated' => Icons.check_circle_outline,
        'pending' => Icons.schedule,
        _ => Icons.warning_amber_outlined,
      };

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(s.consortPageTitle),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textDark,
        elevation: 0.3,
      ),
      body: FutureBuilder<ConsortDossier>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CodakisLogoLoader());
          }
          if (snapshot.hasError) {
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                CodakisAlertBanner.error(message: s.consortLoadError),
                Text('${snapshot.error}'),
                const SizedBox(height: 12),
                CodakisPrimaryButton(
                  label: s.commonRetry,
                  expand: true,
                  variant: CodakisButtonVariant.site,
                  onPressed: () => setState(_reload),
                ),
              ],
            );
          }

          final dossier = snapshot.data!;
          final activePiece = _piece(dossier, _activeKey);
          final activeStatus = activePiece.status;
          final segments = consortPieceKeys
              .map((key) {
                final piece = _piece(dossier, key);
                return CodakisModuleSegment(
                  id: key,
                  label: s.consortPieceTitle(key),
                  meta: s.consortStatus(piece.status),
                );
              })
              .toList();

          return RefreshIndicator(
            onRefresh: () async {
              setState(_reload);
              await _future;
            },
            color: CodakisColors.primary,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              children: [
                _ConsortHero(dossier: dossier, strings: s),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  CodakisAlertBanner.error(message: _error!),
                ],
                if (_success != null) ...[
                  const SizedBox(height: 12),
                  CodakisAlertBanner.success(message: _success!),
                ],
                const SizedBox(height: 16),
                _SummaryPanel(dossier: dossier, strings: s),
                const SizedBox(height: 20),
                CodakisModuleSegmentNav(
                  segments: segments,
                  activeId: _activeKey,
                  onSelect: (key) => setState(() => _activeKey = key),
                ),
                const SizedBox(height: 16),
                _ActivePieceCard(
                  pieceKey: _activeKey,
                  status: activeStatus,
                  piece: activePiece,
                  strings: s,
                  busy: _busyKey == _activeKey,
                  statusColor: _statusColor(activeStatus),
                  statusIcon: _statusIcon(activeStatus),
                  onSubmit: () => _submit(_activeKey),
                ),
                const SizedBox(height: 16),
                _ConsortFooter(strings: s),
                const SizedBox(height: 16),
                _AsidePanel(dossier: dossier, strings: s),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ConsortHero extends StatelessWidget {
  const _ConsortHero({required this.dossier, required this.strings});

  final ConsortDossier dossier;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primaryDark, AppColors.navBgDeep],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.folder_open_rounded, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      strings.consortNavLabel.toUpperCase(),
                      style: GoogleFonts.nunito(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      strings.consortPageTitle,
                      style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      strings.consortPageLead,
                      style: GoogleFonts.nunito(fontSize: 14, height: 1.5, color: Colors.white.withValues(alpha: 0.88)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              _HeroStat(value: '${dossier.validatedCount}', label: strings.consortValidatedShort),
              _HeroStat(value: '${dossier.pendingCount}', label: strings.consortPendingShort),
              _HeroStat(value: '${dossier.progressPercent}%', label: strings.consortProgressLabel),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  const _HeroStat({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
          Text(label, style: GoogleFonts.nunito(fontSize: 11, color: Colors.white.withValues(alpha: 0.8))),
        ],
      ),
    );
  }
}

class _SummaryPanel extends StatelessWidget {
  const _SummaryPanel({required this.dossier, required this.strings});

  final ConsortDossier dossier;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.summaryBg,
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CodakisStatusBadge(
            label: strings.consortDossierStatus(dossier.statut),
            tone: CodakisStatusBadge.dossierStatus(dossier.statut),
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: dossier.progressPercent / 100,
              minHeight: 4,
              backgroundColor: AppColors.border,
              color: CodakisColors.primary,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            strings.consortProgressHint(dossier.validatedCount, dossier.pendingCount, dossier.missingCount),
            style: GoogleFonts.nunito(fontSize: 13, color: AppColors.placeholder, height: 1.45),
          ),
        ],
      ),
    );
  }
}

class _ActivePieceCard extends StatelessWidget {
  const _ActivePieceCard({
    required this.pieceKey,
    required this.status,
    required this.piece,
    required this.strings,
    required this.busy,
    required this.statusColor,
    required this.statusIcon,
    required this.onSubmit,
  });

  final String pieceKey;
  final String status;
  final ConsortPiece piece;
  final AppStrings strings;
  final bool busy;
  final Color statusColor;
  final IconData statusIcon;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return CodakisCard(
      padding: EdgeInsets.zero,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(CodakisRadii.field),
          border: Border(left: BorderSide(color: statusColor, width: 4)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(statusIcon, color: statusColor, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          strings.consortPieceTitle(pieceKey),
                          style: GoogleFonts.nunito(fontSize: 18, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          strings.consortPieceDesc(pieceKey),
                          style: GoogleFonts.nunito(fontSize: 13, color: AppColors.placeholder, height: 1.45),
                        ),
                      ],
                    ),
                  ),
                  CodakisStatusBadge(
                    label: strings.consortStatus(status),
                    tone: CodakisStatusBadge.pieceStatus(status),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text.rich(
                TextSpan(
                  style: GoogleFonts.nunito(fontSize: 14, height: 1.5, color: AppColors.bodyText),
                  children: [
                    TextSpan(text: '${strings.consortRequirementsLabel}: ', style: const TextStyle(fontWeight: FontWeight.w700)),
                    TextSpan(text: strings.consortPieceRequirement(pieceKey)),
                  ],
                ),
              ),
              if (status == 'validated' && piece.validatedAt != null) ...[
                const SizedBox(height: 8),
                Text(
                  strings.consortValidatedOn(piece.validatedAt!),
                  style: GoogleFonts.nunito(fontSize: 13, color: CodakisColors.primary, fontWeight: FontWeight.w600),
                ),
              ],
              if (status != 'validated') ...[
                const SizedBox(height: 16),
                if (status == 'pending')
                  CodakisOutlineButton(
                    label: strings.consortPendingReview,
                    expand: true,
                    onPressed: null,
                  )
                else
                  CodakisPrimaryButton(
                    label: busy ? strings.consortSubmitting : strings.consortActionAdd,
                    expand: true,
                    loading: busy,
                    variant: CodakisButtonVariant.site,
                    size: CodakisButtonSize.lg,
                    onPressed: busy ? null : onSubmit,
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ConsortFooter extends StatelessWidget {
  const _ConsortFooter({required this.strings});

  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: CodakisColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        border: Border.all(color: CodakisColors.primary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(strings.consortFooterText, style: GoogleFonts.nunito(fontSize: 13, height: 1.5)),
        ],
      ),
    );
  }
}

class _AsidePanel extends StatelessWidget {
  const _AsidePanel({required this.dossier, required this.strings});

  final ConsortDossier dossier;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CodakisCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(strings.consortDossierInfoTitle, style: GoogleFonts.nunito(fontWeight: FontWeight.w800, fontSize: 16)),
              const SizedBox(height: 12),
              _InfoRow(label: strings.consortDossierUpdated, value: dossier.updatedAt ?? '—'),
              _InfoRow(label: strings.consortDossierDepot, value: dossier.dateDepot ?? '—'),
            ],
          ),
        ),
        const SizedBox(height: 12),
        CodakisCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(strings.consortStepsTitle, style: GoogleFonts.nunito(fontWeight: FontWeight.w800, fontSize: 16)),
              const SizedBox(height: 10),
              Text('1. ${strings.consortStep1}', style: GoogleFonts.nunito(height: 1.5)),
              Text('2. ${strings.consortStep2}', style: GoogleFonts.nunito(height: 1.5)),
              Text('3. ${strings.consortStep3}', style: GoogleFonts.nunito(height: 1.5)),
              Text('4. ${strings.consortStep4}', style: GoogleFonts.nunito(height: 1.5)),
              const SizedBox(height: 12),
              Text(
                strings.consortSchoolValidationHint,
                style: GoogleFonts.nunito(fontSize: 13, color: AppColors.placeholder, height: 1.45),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: GoogleFonts.nunito(fontSize: 12, color: AppColors.placeholder, fontWeight: FontWeight.w600)),
          ),
          Expanded(child: Text(value, style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}
