#define _GNU_SOURCE
#define _LARGEFILE64_SOURCE
/* stat64/fstat64/lstat64 only became real exports in glibc 2.33; route them to the old __xstat64 family. */
#include <sys/stat.h>
extern int __xstat64(int, const char *, struct stat64 *);
extern int __fxstat64(int, int, struct stat64 *);
extern int __lxstat64(int, const char *, struct stat64 *);
__asm__(".symver __xstat64,__xstat64@GLIBC_2.2.5");
__asm__(".symver __fxstat64,__fxstat64@GLIBC_2.2.5");
__asm__(".symver __lxstat64,__lxstat64@GLIBC_2.2.5");
#define LL_STAT_VER 1 /* _STAT_VER_LINUX on x86_64 */
__attribute__((visibility("hidden"))) int stat64(const char *p, struct stat64 *b) { return __xstat64(LL_STAT_VER, p, b); }
__attribute__((visibility("hidden"))) int fstat64(int fd, struct stat64 *b) { return __fxstat64(LL_STAT_VER, fd, b); }
__attribute__((visibility("hidden"))) int lstat64(const char *p, struct stat64 *b) { return __lxstat64(LL_STAT_VER, p, b); }
