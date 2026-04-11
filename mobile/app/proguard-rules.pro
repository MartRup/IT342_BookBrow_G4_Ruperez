# Add project specific ProGuard rules here.
# Keep data model classes for Gson serialization
-keep class com.example.bookbrow.data.remote.model.** { *; }
-keepattributes Signature
-keepattributes *Annotation*
# Retain Retrofit & OkHttp
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
