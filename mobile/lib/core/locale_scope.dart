import 'package:flutter/widgets.dart';

import 'locale_service.dart';
import '../l10n/app_strings.dart';

class LocaleScope extends InheritedNotifier<LocaleService> {
  const LocaleScope({
    super.key,
    required LocaleService localeService,
    required super.child,
  }) : super(notifier: localeService);

  static LocaleService serviceOf(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<LocaleScope>();
    assert(scope != null, 'LocaleScope not found');
    return scope!.notifier!;
  }

  static AppStrings stringsOf(BuildContext context) => serviceOf(context).strings;
}
