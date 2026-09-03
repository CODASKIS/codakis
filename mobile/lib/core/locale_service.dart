import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../l10n/app_strings.dart';

class LocaleService extends ChangeNotifier {
  static const _storageKey = 'codakis_locale';

  String _locale = 'fr';

  String get locale => _locale;
  bool get isEnglish => _locale.startsWith('en');
  AppStrings get strings => AppStrings(_locale);

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _locale = prefs.getString(_storageKey) ?? 'fr';
    notifyListeners();
  }

  Future<void> setLocale(String value) async {
    final next = value.startsWith('en') ? 'en' : 'fr';
    if (next == _locale) return;
    _locale = next;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, _locale);
  }
}
