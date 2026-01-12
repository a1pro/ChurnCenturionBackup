package com.churncenturion
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.ByteArrayOutputStream

class AppIconModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "AppIconModule"
    }

    @ReactMethod
    fun getAppIcon(packageName: String, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val iconDrawable: Drawable = pm.getApplicationIcon(packageName)
            
            // Drawable to Bitmap
            val bitmap: Bitmap = if (iconDrawable is BitmapDrawable) {
                iconDrawable.bitmap
            } else {
                val bitmap = Bitmap.createBitmap(
                    iconDrawable.intrinsicWidth,
                    iconDrawable.intrinsicHeight,
                    Bitmap.Config.ARGB_8888
                )
                val canvas = Canvas(bitmap)
                iconDrawable.setBounds(0, 0, canvas.width, canvas.height)
                iconDrawable.draw(canvas)
                bitmap
            }
            
            // Bitmap to Base64
            val byteStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteStream)
            val base64Icon = Base64.encodeToString(byteStream.toByteArray(), Base64.DEFAULT)
            promise.resolve("data:image/png;base64,$base64Icon")
            
        } catch (e: PackageManager.NameNotFoundException) {
            promise.reject("ICON_ERROR", "App not found: $packageName")
        } catch (e: Exception) {
            promise.reject("ICON_ERROR", "Failed to get icon: ${e.message}")
        }
    }
}