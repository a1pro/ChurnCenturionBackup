package com.churncenturion.receivers;   

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.churncenturion.services.MidnightSyncService;

public class DailyAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("DailyAlarmReceiver", "Midnight alarm triggered");
        
        try {
            // Start the sync service
            Intent serviceIntent = new Intent(context, MidnightSyncService.class);
            context.startForegroundService(serviceIntent);
            
            // Schedule next day's alarm
            MidnightSyncService.scheduleMidnightAlarm(context);
        } catch (Exception e) {
            Log.e("DailyAlarmReceiver", "Error: " + e.getMessage());
        }
    }
}