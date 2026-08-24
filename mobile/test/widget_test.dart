import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:codakis_mobile/main.dart';

void main() {
  testWidgets('CODAKIS app boots to login', (tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const CodakisApp());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.text('CODAKIS'), findsWidgets);
    expect(find.text('Se connecter'), findsOneWidget);
  });
}
