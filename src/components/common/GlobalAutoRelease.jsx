import { useEffect, useRef } from "react";
import { activeTablesAPI } from "../../services/api";

const GlobalAutoRelease = () => {
    // Only run if we have a valid token (simple check)
    // We could use AuthContext but we want to be lightweight and avoid circular depends if possible
    // But safely, let's just use the API which handles token internally.

    useEffect(() => {
        const checkExpiredSessions = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return; // Don't run if not logged in

            try {
                const activeSessions = await activeTablesAPI.getAll();
                const now = new Date();
                
                for (const session of activeSessions) {
                    // Check status (handle both cases if needed, though usually lowercase from DB)
                    const status = session.status || session.Status;
                    if (status !== 'active') continue;

                    // Normalize keys
                    const bookingType = session.booking_type || session.bookingtype || 'timer';
                    const activeId = session.active_id || session.activeid;
                    
                    // Check all possible end time keys
                    const endTimerStr = session.end_time || session.endtime || session.booking_end_time || session.bookingendtime;
                    
                    if (bookingType === 'timer' && endTimerStr) {
                        const endTime = new Date(endTimerStr);
                        
                        if (isNaN(endTime.getTime())) continue;

                        // Check if expired
                        if (endTime < now) {
                            console.log(`[Global Auto-Release] EXPIRED! Releasing session ${activeId}`);
                            try {
                                await activeTablesAPI.autoRelease({ 
                                    active_id: activeId
                                });
                                // Dispatch event to notify listeners (e.g. Dashboard) to refresh immediately
                                window.dispatchEvent(new CustomEvent('table-data-changed', { 
                                    detail: { activeId, reason: 'auto-release' } 
                                }));
                            } catch (e) {
                                console.error("[Global Auto-Release] Failed:", e);
                            }
                        }
                    }
                }
            } catch (err) {
                // Silent catch
            }
        };

        // Run every 5 seconds to reduce server load
        const intervalId = setInterval(checkExpiredSessions, 5000);
        
        // Run immediately on mount
        checkExpiredSessions();

        return () => clearInterval(intervalId);
    }, []);

    return null; // Component renders nothing
};

export default GlobalAutoRelease;
