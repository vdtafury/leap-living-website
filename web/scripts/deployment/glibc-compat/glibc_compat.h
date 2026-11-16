/* Pin glibc symbol versions so the addon loads on glibc >= 2.17/2.28 (CloudLinux 7/8). */
#ifndef LL_GLIBC_COMPAT_H
#define LL_GLIBC_COMPAT_H
__asm__(".symver exp,exp@GLIBC_2.2.5");
__asm__(".symver log,log@GLIBC_2.2.5");
__asm__(".symver log2,log2@GLIBC_2.2.5");
__asm__(".symver pow,pow@GLIBC_2.2.5");
__asm__(".symver dlopen,dlopen@GLIBC_2.2.5");
__asm__(".symver dlclose,dlclose@GLIBC_2.2.5");
__asm__(".symver dlerror,dlerror@GLIBC_2.2.5");
__asm__(".symver dlsym,dlsym@GLIBC_2.2.5");
__asm__(".symver pthread_create,pthread_create@GLIBC_2.2.5");
__asm__(".symver pthread_join,pthread_join@GLIBC_2.2.5");
__asm__(".symver pthread_mutex_trylock,pthread_mutex_trylock@GLIBC_2.2.5");
__asm__(".symver pthread_mutexattr_destroy,pthread_mutexattr_destroy@GLIBC_2.2.5");
__asm__(".symver pthread_mutexattr_init,pthread_mutexattr_init@GLIBC_2.2.5");
__asm__(".symver pthread_mutexattr_settype,pthread_mutexattr_settype@GLIBC_2.2.5");
__asm__(".symver pthread_once,pthread_once@GLIBC_2.2.5");
#endif
