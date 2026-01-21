import 'package:flutter/material.dart';
import 'home_page.dart';
import '../../../profile/presentation/pages/profile_page.dart';
import '../../../../core/theme/app_theme.dart';

class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomePage(),
    const _DummyPage(title: 'Calendar', icon: Icons.calendar_month),
    const Center(child: SizedBox()), // Placeholder for FAB
    const _DummyPage(title: 'Documents', icon: Icons.description),
    const ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      floatingActionButton: Container(
        height: 72,
        width: 72,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryColor.withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: FloatingActionButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Fitur Tambah belum tersedia'),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            );
          },
          backgroundColor: AppTheme.primaryColor,
          elevation: 0,
          shape: const CircleBorder(),
          child: const Icon(Icons.add, color: Colors.white, size: 36),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: Container(
        height: 100,
        decoration: BoxDecoration(
          color: Colors.transparent,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 20,
              offset: const Offset(0, -10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(35)),
          child: BottomAppBar(
            padding: EdgeInsets.zero,
            color: const Color(0xFFF5F3FF), // Match image light purple
            shape: const CircularNotchedRectangle(),
            notchMargin: 12,
            elevation: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.home_rounded),
                _buildNavItem(1, Icons.calendar_today_rounded),
                const SizedBox(width: 60), // Space for FAB
                _buildNavItem(3, Icons.insert_drive_file_rounded),
                _buildNavItem(4, Icons.people_rounded),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon) {
    final isSelected = _currentIndex == index;
    return IconButton(
      onPressed: () {
        setState(() {
          _currentIndex = index;
        });
      },
      icon: Icon(
        icon,
        size: 28,
        color: isSelected
            ? AppTheme.primaryColor
            : AppTheme.primaryColor.withOpacity(0.4),
      ),
    );
  }
}

class _DummyPage extends StatelessWidget {
  final String title;
  final IconData icon;

  const _DummyPage({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 80, color: AppTheme.primaryLight),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Halaman ini sedang dalam pengembangan',
              style: TextStyle(color: AppTheme.textLight),
            ),
          ],
        ),
      ),
    );
  }
}
