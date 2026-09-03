import '../../core/api_client.dart';

const consortPieceKeys = ['id', 'birth', 'medical', 'photos', 'address', 'stamps'];

class ConsortPiece {
  const ConsortPiece({required this.key, required this.status, this.validatedAt});

  final String key;
  final String status;
  final String? validatedAt;

  factory ConsortPiece.fromJson(Map<String, dynamic> json) {
    return ConsortPiece(
      key: json['key'] as String? ?? '',
      status: json['status'] as String? ?? 'missing',
      validatedAt: json['validated_at'] as String?,
    );
  }
}

class ConsortDossier {
  const ConsortDossier({
    required this.id,
    required this.statut,
    required this.validatedCount,
    required this.pendingCount,
    required this.missingCount,
    required this.totalCount,
    required this.progressPercent,
    required this.pieces,
    this.dateDepot,
    this.updatedAt,
  });

  final String id;
  final String statut;
  final int validatedCount;
  final int pendingCount;
  final int missingCount;
  final int totalCount;
  final int progressPercent;
  final List<ConsortPiece> pieces;
  final String? dateDepot;
  final String? updatedAt;

  factory ConsortDossier.fromJson(Map<String, dynamic> json) {
    return ConsortDossier(
      id: '${json['id']}',
      statut: json['statut'] as String? ?? 'pieces_incompletes',
      validatedCount: json['validated_count'] as int? ?? 0,
      pendingCount: json['pending_count'] as int? ?? 0,
      missingCount: json['missing_count'] as int? ?? 0,
      totalCount: json['total_count'] as int? ?? 6,
      progressPercent: json['progress_percent'] as int? ?? 0,
      dateDepot: json['date_depot'] as String?,
      updatedAt: json['updated_at'] as String?,
      pieces: (json['pieces'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(ConsortPiece.fromJson)
          .toList(),
    );
  }
}

class ConsortService {
  ConsortService(this._api);

  final ApiClient _api;

  Future<ConsortDossier> fetchDossier() async {
    final data = await _api.get('/candidat/consort', auth: true);
    return ConsortDossier.fromJson(data);
  }

  Future<ConsortDossier> submitPiece(String pieceKey) async {
    final data = await _api.post('/candidat/consort/pieces/$pieceKey/submit', auth: true);
    return ConsortDossier.fromJson(data);
  }
}
