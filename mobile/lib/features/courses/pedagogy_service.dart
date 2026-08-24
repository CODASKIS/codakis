import '../../core/api_client.dart';

class CourseTheme {
  const CourseTheme({
    required this.id,
    required this.titleFr,
    required this.titleEn,
    required this.leconCount,
    required this.isPremium,
    required this.locked,
  });

  final String id;
  final String titleFr;
  final String titleEn;
  final int leconCount;
  final bool isPremium;
  final bool locked;

  factory CourseTheme.fromJson(Map<String, dynamic> json) {
    return CourseTheme(
      id: json['id'] as String,
      titleFr: json['title_fr'] as String? ?? '',
      titleEn: json['title_en'] as String? ?? '',
      leconCount: json['lecon_count'] as int? ?? 0,
      isPremium: json['is_premium'] as bool? ?? false,
      locked: json['locked'] as bool? ?? false,
    );
  }
}

class PedagogyService {
  PedagogyService(this._api);

  final ApiClient _api;

  Future<List<CourseTheme>> fetchThemes() async {
    final rows = await _api.getList('/candidat/pedagogy/themes', auth: true);
    return rows
        .whereType<Map<String, dynamic>>()
        .map(CourseTheme.fromJson)
        .toList();
  }
}
