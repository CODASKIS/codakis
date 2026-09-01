import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../widgets/codakis_app_drawer.dart';
import '../../widgets/pg_bottom_nav.dart';
import '../auth/auth_service.dart';
import '../auth/login_page.dart';
import '../consort/consort_page.dart';
import '../consort/consort_service.dart';
import '../courses/courses_page.dart';
import '../courses/pedagogy_service.dart';
import '../courses/theme_detail_page.dart';
import '../profile/profile_page.dart';
import '../profile/profile_service.dart';
import '../quizzes/quizzes_page.dart';
import '../school/school_page.dart';
import '../school/school_service.dart';
import 'home_page.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key, required this.authService});

  final AuthService authService;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> with WidgetsBindingObserver {
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  int _currentIndex = 0;
  late final PedagogyService _pedagogyService;
  late final SchoolService _schoolService;
  late final ConsortService _consortService;
  late final ProfileService _profileService;
  int _dataRefreshToken = 0;
  CandidatProgress? _progress;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _pedagogyService = PedagogyService(widget.authService.api);
    _schoolService = SchoolService(widget.authService.api);
    _consortService = ConsortService(widget.authService.api);
    _profileService = ProfileService(widget.authService.api);
    _loadProgress();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _refreshData();
  }

  Future<void> _loadProgress() async {
    try {
      final progress = await _pedagogyService.fetchProgress();
      if (mounted) setState(() => _progress = progress);
    } catch (_) {}
  }

  void _refreshData() {
    setState(() => _dataRefreshToken++);
    _loadProgress();
  }

  void _onNavTap(int index) {
    setState(() => _currentIndex = index);
    _loadProgress();
  }

  void _openDrawer() => _scaffoldKey.currentState?.openDrawer();

  void _openTheme(CourseTheme theme, int index) {
    Navigator.of(context)
        .push(
          MaterialPageRoute(
            builder: (_) => ThemeDetailPage(
              theme: theme,
              pedagogyService: _pedagogyService,
              themeIndex: index,
            ),
          ),
        )
        .then((_) => _loadProgress());
  }

  void _openConsort() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ConsortPage(consortService: _consortService)),
    );
  }

  Future<void> _logout() async {
    await widget.authService.logout();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => LoginPage(authService: widget.authService)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomePage(
        key: ValueKey('home-$_dataRefreshToken'),
        pedagogyService: _pedagogyService,
        progress: _progress,
        onOpenDrawer: _openDrawer,
        onOpenCourses: () => _onNavTap(1),
        onOpenQuizzes: () => _onNavTap(2),
        onThemeTap: _openTheme,
      ),
      CoursesPage(
        pedagogyService: _pedagogyService,
        refreshToken: _dataRefreshToken,
        onThemeTap: _openTheme,
      ),
      QuizzesPage(pedagogyService: _pedagogyService),
      SchoolPage(schoolService: _schoolService),
      ProfilePage(
        profileService: _profileService,
        onLogout: _logout,
        onOpenCourses: () => _onNavTap(1),
        onOpenQuizzes: () => _onNavTap(2),
        onOpenSchool: () => _onNavTap(3),
        onOpenConsort: _openConsort,
      ),
    ];

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.scaffoldBackground,
      drawer: CodakisAppDrawer(
        currentIndex: _currentIndex,
        onNavigate: _onNavTap,
        onOpenConsort: _openConsort,
        onLogout: _logout,
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _onNavTap(2),
        backgroundColor: AppColors.primary,
        elevation: 4,
        child: const Icon(Icons.quiz_outlined, color: Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: PgBottomNavigationBar(
        currentIndex: _currentIndex,
        onNavTap: _onNavTap,
      ),
    );
  }
}
