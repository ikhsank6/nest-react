import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        if (state is! AuthAuthenticated) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final user = state.user;
        return Scaffold(
          backgroundColor: AppTheme.backgroundColor,
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: () async {
                context.read<AuthBloc>().add(AuthCheckStatus());
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header with avatar and greeting
                      Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: AppTheme.primaryColor, width: 2),
                            ),
                            child: ClipOval(
                              child: user.avatar != null
                                  ? Image.network(
                                      '${ApiEndpoints.baseUrl}${ApiEndpoints.profileAvatarByUuid(user.uuid)}',
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Container(
                                        color: AppTheme.primaryLight,
                                        child: const Icon(Icons.person,
                                            color: AppTheme.primaryColor),
                                      ),
                                    )
                                  : Container(
                                      color: AppTheme.primaryLight,
                                      child: const Icon(Icons.person,
                                          color: AppTheme.primaryColor),
                                    ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Hello!',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                                Text(
                                  user.name,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: AppTheme.cardShadow,
                            ),
                            child: IconButton(
                              icon: const Icon(Icons.notifications_outlined),
                              color: AppTheme.textPrimary,
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content:
                                        const Text('Notifikasi belum tersedia'),
                                    behavior: SnackBarBehavior.floating,
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Progress Card - Main Hero Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Color(0xFF7C3AED),
                              Color(0xFF6D28D9),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: AppTheme.elevatedShadow,
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Your today\'s task\nalmost done!',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.9),
                                      fontSize: 16,
                                      height: 1.4,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text(
                                      'View Task',
                                      style: TextStyle(
                                        color: AppTheme.primaryColor,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            // Circular Progress
                            SizedBox(
                              width: 80,
                              height: 80,
                              child: Stack(
                                children: [
                                  SizedBox(
                                    width: 80,
                                    height: 80,
                                    child: CircularProgressIndicator(
                                      value: 0.85,
                                      strokeWidth: 8,
                                      backgroundColor:
                                          Colors.white.withOpacity(0.3),
                                      valueColor:
                                          const AlwaysStoppedAnimation<Color>(
                                              Colors.white),
                                    ),
                                  ),
                                  const Center(
                                    child: Text(
                                      '85%',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // In Progress Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'In Progress',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryLight,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.add,
                                size: 18, color: AppTheme.primaryColor),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Project Cards Row
                      SizedBox(
                        height: 150,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: [
                            _ProjectCard(
                              title: 'Office Project',
                              subtitle: 'App Design',
                              color: const Color(0xFFDDD6FE),
                              icon: Icons.work_outline,
                            ),
                            const SizedBox(width: 12),
                            _ProjectCard(
                              title: 'Personal Project',
                              subtitle: 'Learning',
                              color: const Color(0xFFFED7AA),
                              icon: Icons.lightbulb_outline,
                              hasProgress: true,
                              progress: 0.6,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Task Groups Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Task Groups',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(4),
                            child: const Icon(Icons.more_horiz,
                                color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Task Group Items
                      _TaskGroupItem(
                        icon: Icons.work_outline,
                        iconColor: AppTheme.primaryColor,
                        iconBgColor: AppTheme.primaryLight,
                        title: 'Office Project',
                        taskCount: '23 Tasks',
                        progress: 0.70,
                      ),
                      const SizedBox(height: 12),
                      _TaskGroupItem(
                        icon: Icons.person_outline,
                        iconColor: const Color(0xFFF97316),
                        iconBgColor: const Color(0xFFFED7AA),
                        title: 'Personal Project',
                        taskCount: '30 Tasks',
                        progress: 0.55,
                      ),
                      const SizedBox(height: 12),
                      _TaskGroupItem(
                        icon: Icons.menu_book_outlined,
                        iconColor: const Color(0xFF10B981),
                        iconBgColor: const Color(0xFFD1FAE5),
                        title: 'Daily Study',
                        taskCount: '30 Tasks',
                        progress: 0.67,
                      ),
                      const SizedBox(height: 24),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  // Remove _showLogoutDialog and _QuickActionCard if they are no longer used here
}

class _ProjectCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final Color color;
  final IconData icon;
  final bool hasProgress;
  final double progress;

  const _ProjectCard({
    required this.title,
    required this.subtitle,
    required this.color,
    required this.icon,
    this.hasProgress = false,
    this.progress = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 20, color: AppTheme.textPrimary),
              ),
              const Spacer(),
              if (hasProgress)
                Text(
                  '${(progress * 100).toInt()}%',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: AppTheme.textPrimary,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 12,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: AppTheme.textPrimary,
            ),
          ),
          if (hasProgress) ...[
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.white.withOpacity(0.5),
                valueColor:
                    const AlwaysStoppedAnimation<Color>(AppTheme.successColor),
                minHeight: 4,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _TaskGroupItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final Color iconBgColor;
  final String title;
  final String taskCount;
  final double progress;

  const _TaskGroupItem({
    required this.icon,
    required this.iconColor,
    required this.iconBgColor,
    required this.title,
    required this.taskCount,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  taskCount,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 48,
            height: 48,
            child: Stack(
              children: [
                SizedBox(
                  width: 48,
                  height: 48,
                  child: CircularProgressIndicator(
                    value: progress,
                    strokeWidth: 5,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation<Color>(iconColor),
                  ),
                ),
                Center(
                  child: Text(
                    '${(progress * 100).toInt()}%',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
