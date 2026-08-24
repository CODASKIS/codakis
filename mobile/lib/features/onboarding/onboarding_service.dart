import 'package:shared_preferences/shared_preferences.dart';

class OnboardingService {
  static const _completedKey = 'codakis_onboarding_completed';

  Future<bool> isCompleted() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_completedKey) ?? false;
  }

  Future<void> complete() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_completedKey, true);
  }
}
