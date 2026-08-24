import '../../core/api_client.dart';

class DrivingSchool {
  const DrivingSchool({
    required this.id,
    required this.name,
    required this.city,
    required this.address,
    required this.countryCode,
    required this.priceFrom,
    required this.description,
    required this.phone,
  });

  final String id;
  final String name;
  final String city;
  final String address;
  final String countryCode;
  final int priceFrom;
  final String? description;
  final String? phone;

  factory DrivingSchool.fromJson(Map<String, dynamic> json) {
    return DrivingSchool(
      id: '${json['id']}',
      name: json['name'] as String? ?? '',
      city: json['city'] as String? ?? '',
      address: json['address'] as String? ?? '',
      countryCode: json['country_code'] as String? ?? '',
      priceFrom: json['price_from'] as int? ?? 0,
      description: json['description'] as String?,
      phone: json['phone'] as String?,
    );
  }
}

class SchoolForfait {
  const SchoolForfait({
    required this.id,
    required this.labelFr,
    required this.labelEn,
    required this.prix,
    required this.heuresConduite,
    required this.descriptionFr,
  });

  final String id;
  final String labelFr;
  final String labelEn;
  final int prix;
  final int? heuresConduite;
  final String? descriptionFr;

  factory SchoolForfait.fromJson(Map<String, dynamic> json) {
    return SchoolForfait(
      id: '${json['id']}',
      labelFr: json['label_fr'] as String? ?? '',
      labelEn: json['label_en'] as String? ?? '',
      prix: json['prix'] as int? ?? 0,
      heuresConduite: json['heures_conduite'] as int?,
      descriptionFr: json['description_fr'] as String?,
    );
  }
}

class DrivingSchoolDetail extends DrivingSchool {
  const DrivingSchoolDetail({
    required super.id,
    required super.name,
    required super.city,
    required super.address,
    required super.countryCode,
    required super.priceFrom,
    required super.description,
    required super.phone,
    required this.forfaits,
    required this.longDescription,
  });

  final List<SchoolForfait> forfaits;
  final String? longDescription;

  factory DrivingSchoolDetail.fromJson(Map<String, dynamic> json) {
    return DrivingSchoolDetail(
      id: '${json['id']}',
      name: json['name'] as String? ?? '',
      city: json['city'] as String? ?? '',
      address: json['address'] as String? ?? '',
      countryCode: json['country_code'] as String? ?? '',
      priceFrom: json['price_from'] as int? ?? 0,
      description: json['description'] as String?,
      phone: json['phone'] as String?,
      longDescription: json['long_description'] as String?,
      forfaits: (json['forfaits'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SchoolForfait.fromJson)
          .toList(),
    );
  }
}

class CandidatInscription {
  const CandidatInscription({
    required this.id,
    required this.schoolName,
    required this.forfaitLabel,
    required this.statut,
    required this.heuresRestantes,
    required this.heuresTotal,
  });

  final String id;
  final String schoolName;
  final String forfaitLabel;
  final String statut;
  final int heuresRestantes;
  final int heuresTotal;

  factory CandidatInscription.fromJson(Map<String, dynamic> json) {
    return CandidatInscription(
      id: '${json['id']}',
      schoolName: json['school_name'] as String? ?? '',
      forfaitLabel: json['forfait_label'] as String? ?? '',
      statut: json['statut'] as String? ?? '',
      heuresRestantes: json['heures_conduite_restantes'] as int? ?? 0,
      heuresTotal: json['heures_conduite_total'] as int? ?? 0,
    );
  }
}

class SchoolService {
  SchoolService(this._api);

  final ApiClient _api;

  Future<List<DrivingSchool>> fetchSchools({String? query, String? city}) async {
    final params = <String, String>{};
    if (query != null && query.isNotEmpty) params['q'] = query;
    if (city != null && city.isNotEmpty) params['ville'] = city;
    final uri = Uri(
      path: '/public/auto-ecoles',
      queryParameters: params.isEmpty ? null : params,
    );
    final rows = await _api.getList('${uri.path}${uri.hasQuery ? '?${uri.query}' : ''}');
    return rows.whereType<Map<String, dynamic>>().map(DrivingSchool.fromJson).toList();
  }

  Future<DrivingSchoolDetail> fetchSchool(String schoolId) async {
    final data = await _api.get('/public/auto-ecoles/$schoolId');
    return DrivingSchoolDetail.fromJson(data);
  }

  Future<List<CandidatInscription>> fetchMyInscriptions() async {
    final rows = await _api.getList('/candidat/inscriptions', auth: true);
    return rows.whereType<Map<String, dynamic>>().map(CandidatInscription.fromJson).toList();
  }

  Future<void> enroll({
    required String autoEcoleId,
    required String forfaitId,
    String? paymentRef,
  }) async {
    await _api.post(
      '/candidat/inscriptions',
      auth: true,
      body: {
        'auto_ecole_id': autoEcoleId,
        'forfait_id': forfaitId,
        if (paymentRef != null) 'payment_ref': paymentRef,
      },
    );
  }
}
