package com.churncenturion.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.churncenturion.services.MidnightSyncService;

public class BootCompletedReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("BootCompletedReceiver", "Device booted, scheduling midnight sync");
        
        try {
            // Start the midnight sync service
            Intent serviceIntent = new Intent(context, MidnightSyncService.class);
            context.startForegroundService(serviceIntent);
            
            // Schedule next midnight alarm
            MidnightSyncService.scheduleMidnightAlarm(context);
        } catch (Exception e) {
            Log.e("BootCompletedReceiver", "Error: " + e.getMessage());
        }
    }
}