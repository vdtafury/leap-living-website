// GLIBCXX_3.4.29 (GCC 11+) added std::__throw_bad_array_new_length; older libstdc++ (GCC 8) lacks it.
#include <new>
namespace std {
__attribute__((visibility("hidden"), noreturn)) void __throw_bad_array_new_length() { throw std::bad_array_new_length(); }
}
