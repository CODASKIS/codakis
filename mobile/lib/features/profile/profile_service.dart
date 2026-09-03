import '../../core/api_client.dart';

class UserProfile {
  const UserProfile({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.city,
    required this.countryCode,
    required this.langue,
    required this.plan,
  });

  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phone;
  final String? city;
  final String countryCode;
  final String langue;
  final String? plan;

  String get fullName => '$firstName $lastName'.trim();

  String get initials {
    final first = firstName.trim();
    final last = lastName.trim();
    if (first.isEmpty && last.isEmpty) return '?';
    if (first.isNotEmpty && last.isNotEmpty) return '${first[0]}${last[0]}'.toUpperCase();
    final single = first.isNotEmpty ? first : last;
    return single.length >= 2 ? single.substring(0, 2).toUpperCase() : single[0].toUpperCase();
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: '${json['id']}',
      email: json['email'] as String? ?? '',
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      phone: json['phone'] as String?,
      city: json['city'] as String?,
      countryCode: json['country_code'] as String? ?? '',
      langue: json['langue'] as String? ?? 'fr',
      plan: json['plan'] as String?,
    );
  }
}

class ProfileService {
  ProfileService(this._api);

  final ApiClient _api;

  Future<UserProfile> fetchMe() async {
    final data = await _api.get('/users/me', auth: true);
    return UserProfile.fromJson(data);
  }

  Future<UserProfile> updateMe({
    String? firstName,
    String? lastName,
    String? phone,
    String? city,
    String? langue,
  }) async {
    final data = await _api.patch(
      '/users/me',
      auth: true,
      body: {
        if (firstName != null) 'first_name': firstName,
        if (lastName != null) 'last_name': lastName,
        if (phone != null) 'phone': phone,
        if (city != null) 'city': city,
        if (langue != null) 'langue': langue,
      },
    );
    return UserProfile.fromJson(data);
  }
}
