import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabaseAPI } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

import Header from '@/components/display/Header';
import BackgroundLeaves from '@/components/display/BackgroundLeaves';
import InternalCircle from '@/components/display/InternalCircle';
import SmallGroups from '@/components/display/SmallGroups';
import DutyPerson from '@/components/display/DutyPerson';
import NoticesGallery from '@/components/display/NoticesGallery';
import Congratulations from '@/components/display/Congratulations';
import FixedRules from '@/components/display/FixedRules';
import Ticker from '@/components/display/Ticker';
import KickoffMode from '@/components/display/KickoffMode';
import BreakMode from '@/components/display/BreakMode';
import MotzeiMode from '@/components/display/MotzeiMode';
import TimerOverlay from '@/components/display/TimerOverlay';
import PhoneNumbers from '@/components/display/PhoneNumbers';
import BackgroundLayer from '@/components/display/BackgroundLayer';

const dayMap = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

const screenScales = {
  '14': 0.45,
  '32': 0.75,
  '50': 1,
  '60': 1.25
};

export default function Display({ previewMode = false }) {
  const [displayMode, setDisplayMode] = useState('normal');
  const [breakDuration, setBreakDuration] = useState(10);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const queryClient = useQueryClient();
  
  const [currentDayKey, setCurrentDayKey] = useState(() => dayMap[new Date().getDay()]);

  // Auto page reload every 30 minutes (safety net) — disabled in preview
  useEffect(() => {
    if (previewMode) return;
    const reloadInterval = setInterval(() => {
      window.location.reload();
    }, 30 * 60 * 1000);
    return () => clearInterval(reloadInterval);
  }, [previewMode]);

  // Auto-update day at midnight
  useEffect(() => {
    const checkDay = () => {
      const newDay = dayMap[new Date().getDay()];
      setCurrentDayKey(prev => {
        if (prev !== newDay) {
          queryClient.invalidateQueries(['daySchedules']);
          queryClient.invalidateQueries(['notices']);
          return newDay;
        }
        return prev;
      });
    };
    const interval = setInterval(checkDay, 60000); // check every minute
    return () => clearInterval(interval);
  }, [queryClient]);

  // Listen for refresh messages from Admin — disabled in preview
  useEffect(() => {
    if (previewMode) return;
    const handleMessage = (event) => {
      if (event.data?.type === 'REFRESH_DISPLAY') {
        queryClient.invalidateQueries(['settings']);
        queryClient.invalidateQueries(['daySchedules']);
        queryClient.invalidateQueries(['notices']);
      }
    };
    window.addEventListener('message', handleMessage);
    
    // Check localStorage for cross-tab communication
    const checkRefresh = () => {
      const refreshFlag = localStorage.getItem('display_refresh');
      if (refreshFlag) {
        localStorage.removeItem('display_refresh');
        queryClient.invalidateQueries(['settings']);
        queryClient.invalidateQueries(['daySchedules']);
        queryClient.invalidateQueries(['notices']);
      }
      
      // Sync header timer display from localStorage (TimerOverlay owns stop logic)
      const timerEnd = localStorage.getItem('display_timer_end');
      if (timerEnd) {
        const endTime = parseInt(timerEnd);
        if (endTime > Date.now()) {
          setTimerEndTime(endTime);
        } else {
          setTimerEndTime(null);
        }
      } else {
        setTimerEndTime(null);
      }
    };
    
    checkRefresh();
    const interval = setInterval(checkRefresh, 1000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [queryClient]);

  // Fetch data - forced refetch every 20 seconds
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => supabaseAPI.find('SystemSettings'),
    refetchInterval: 20000
  });

  const { data: daySchedules } = useQuery({
    queryKey: ['daySchedules'],
    queryFn: () => supabaseAPI.find('DaySchedule'),
    refetchInterval: 20000
  });

  const { data: notices } = useQuery({
    queryKey: ['notices'],
    queryFn: () => supabaseAPI.find('Notice'),
    refetchInterval: 20000
  });

  const { data: phoneNumbers = [] } = useQuery({
    queryKey: ['phoneNumbers'],
    queryFn: () => supabaseAPI.find('PhoneNumbers'),
    refetchInterval: 20000
  });

  const systemSettings = settings?.[0] || { screenProfile: '50' };
  const screenScale = screenScales[systemSettings.screenProfile] || 1;
  const customConfig = systemSettings.customModeConfig || {};
  const design = systemSettings.boardDesign || {};
  const bgColor = design.bgColor || '#F2F4F7';
  const primaryColor = design.primaryColor || '#2F4580';
  const sideWidth = design.sideColumnWidth ? `${design.sideColumnWidth}%` : '25%';
  const centerWidth = design.sideColumnWidth ? `${100 - 2 * parseInt(design.sideColumnWidth)}%` : '50%';
  const noticeFontScale = parseFloat(design.noticeFontScale) || 1.0;
  const cardOpacity = parseInt(design.cardOpacity) || 88;
  const clockFontScale = parseFloat(design.clockFontScale) || 1.0;
  const headerTitleScale = parseFloat(design.headerTitleScale) || 1.0;
  const blockTextScale = parseFloat(design.blockTextScale) || 1.0;
  const tickerFontScale = parseFloat(design.tickerFontScale) || 1.0;
  const timerFullScreenSeconds = ((systemSettings.timerFullScreenMinutes ?? 3) * 60);

  const todaySchedule = useMemo(() => {
    const overrideDay = systemSettings.overrideDay;
    const targetDay = overrideDay || currentDayKey;
    return daySchedules?.find(d => d.dayOfWeek === targetDay) || {};
  }, [daySchedules, currentDayKey, systemSettings.overrideDay]);

  const todayNotices = useMemo(() => {
    return notices?.filter(n => 
      n.active && 
      (!n.days?.length || n.days.includes(currentDayKey))
    ) || [];
  }, [notices, currentDayKey]);

  // Clock tick every 30 seconds to keep schedule logic alive
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  // Auto-compute current session for each workshop based on weekStartDate
  const workshopsWithAutoSession = useMemo(() => {
    const workshops = todaySchedule.workshops || [];
    if (!workshops.length) return workshops;
    
    // Global or day-level pause
    const globalPause = systemSettings.pauseAllSessionAdvance;
    const dayPause = todaySchedule.pauseAllSessionAdvance;
    
    return workshops.map(w => {
      if (globalPause || dayPause || w.pauseSessionAdvance) return w;
      
      const weekStart = todaySchedule.weekStartDate ? new Date(todaySchedule.weekStartDate) : null;
      if (!weekStart) return w;
      
      const now = new Date();
      const msSinceStart = now - weekStart;
      if (msSinceStart < 0) return w; // hasn't started yet
      
      const weeksPassed = Math.floor(msSinceStart / (7 * 24 * 60 * 60 * 1000));
      const baseSession = w.baseSession || w.currentSession || 1;
      const autoSession = Math.min(baseSession + weeksPassed, w.totalSessions || 12);
      return { ...w, currentSession: autoSession };
    });
  }, [todaySchedule, systemSettings.pauseAllSessionAdvance]);

  // Get current workshop based on time
  const currentWorkshop = useMemo(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return workshopsWithAutoSession.find(w => {
      if (!w.startTime || !w.endTime) return false;
      const [startH, startM] = w.startTime.split(':').map(Number);
      const [endH, endM] = w.endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      return currentTime >= start && currentTime <= end;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaySchedule.workshops, tick]);

  // Calculate current circle list based on week
  const currentCircleNames = useMemo(() => {
    const lists = todaySchedule.internalCircleLists || [];
    if (lists.length === 0) return [];
    
    const startDate = todaySchedule.weekStartDate ? new Date(todaySchedule.weekStartDate) : new Date();
    const now = new Date();
    const weeksDiff = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
    const index = weeksDiff % lists.length;
    
    return lists[index] || [];
  }, [todaySchedule]);

  // Scheduler Engine - re-runs whenever data updates or clock ticks
  useEffect(() => {
    // Check for override first
    if (systemSettings.overrideMode && systemSettings.overrideMode !== 'none') {
      setDisplayMode(systemSettings.overrideMode);
      return;
    }

    // Check for Saturday night (Motzei Shabbat)
    const now = new Date();
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 6 && now.getHours() >= 19) {
      setDisplayMode('motzei');
      return;
    }

    // Check for kickoff timing (1 min before start until 5 min after)
    if (currentWorkshop?.kickoffEnabled && currentWorkshop?.startTime) {
      const [startH, startM] = currentWorkshop.startTime.split(':').map(Number);
      const workshopStart = startH * 60 + startM;
      const currentTime = now.getHours() * 60 + now.getMinutes();
      if (currentTime >= workshopStart - 1 && currentTime < workshopStart + 5) {
        setDisplayMode('kickoff');
        return;
      }
    }

    setDisplayMode('normal');
  }, [systemSettings, currentWorkshop, tick]);

  const handleKickoffComplete = useCallback(() => {
    setDisplayMode('normal');
  }, []);

  const handleBreakComplete = useCallback(() => {
    setDisplayMode('normal');
  }, []);

  const shouldShow = (element) => {
    if (displayMode !== 'custom') return true;
    if (customConfig.exclusiveNotices && element !== 'showNotices' && element !== 'showHeader' && element !== 'showTicker') {
      return false;
    }
    return customConfig[element] !== false;
  };

  const [currentBg, setCurrentBg] = useState(null);
  const isFullBg = currentBg && currentBg.type !== 'none' && (currentBg.displayMode || 'full') === 'full';

  return (
    <div 
      className={previewMode ? "absolute inset-0 w-full h-full overflow-hidden" : "fixed inset-0 w-full h-full overflow-hidden"}
      style={{ 
        backgroundColor: isFullBg ? 'transparent' : bgColor,
        fontFamily: "'EFT_Hebrew', 'Heebo', 'system-ui', sans-serif"
      }}
      dir="rtl"
    >
      {/* CSS Variables */}
      <style>{`
        :root {
          --primary: ${primaryColor};
          --secondary: #6C7C94;
          --leaf: #7A86A8;
          --bg: ${bgColor};
          --neutral: #D6DCE5;
          --accent: #8FAE9B;
          --radius-lg: 24px;
          --shadow-soft: 0 8px 30px rgba(47,62,85,0.08);
        }
        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--secondary); }
        .text-leaf { color: var(--leaf); }
        .text-accent { color: var(--accent); }
        .bg-primary { background-color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .bg-leaf { background-color: var(--leaf); }
        .bg-accent { background-color: var(--accent); }
      `}</style>

      {/* Custom background layer — below everything */}
      <BackgroundLayer settings={systemSettings} onCurrentBgChange={setCurrentBg} />

      {!isFullBg && <BackgroundLeaves 
        extraLeaves={
          (displayMode === 'normal' || displayMode === 'custom') &&
          (todaySchedule.hideInternalCircle || currentWorkshop?.hideInternalCircle || !currentCircleNames.length) &&
          (todaySchedule.hideSmallGroups || currentWorkshop?.hideSmallGroups || !todaySchedule.smallGroups?.length)
        }
      />}

      <AnimatePresence mode="wait">
        {displayMode === 'break' && (
          <BreakMode 
            key="break"
            duration={systemSettings.breakConfig?.defaultDuration || breakDuration}
            screenScale={screenScale}
            onComplete={handleBreakComplete}
            breakConfig={systemSettings.breakConfig || {}}
          />
        )}
        
        {displayMode === 'motzei' && (
          <MotzeiMode key="motzei" screenScale={screenScale} motzeiConfig={systemSettings.motzeiConfig || {}} />
        )}
      </AnimatePresence>

      {(displayMode === 'normal' || displayMode === 'custom' || displayMode === 'kickoff') && (
        <div className="h-full flex flex-col">
          {shouldShow('showHeader') && (
            <Header 
              currentSession={currentWorkshop?.currentSession || 1}
              totalSessions={12}
              screenScale={screenScale}
              showProgress={displayMode !== 'custom' || customConfig.showProgress !== false}
              timerEndTime={timerEndTime}
              timerTitle={systemSettings.timerTitle || ''}
              workshopName={currentWorkshop?.name || ''}
              clockFontScale={clockFontScale}
              headerTitleScale={headerTitleScale}
            />
          )}

          <main 
            className="flex-1 relative z-10 overflow-hidden"
            style={{ 
              padding: `${20 * screenScale}px`,
              paddingBottom: `${70 * screenScale}px`
            }}
          >
            {/* Custom message full screen */}
            {displayMode === 'custom' && customConfig.fullScreenMessage && customConfig.customMessage && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-20">
                <div 
                  className="text-primary text-center font-medium"
                  style={{ fontSize: `${48 * screenScale}px`, maxWidth: '80%' }}
                >
                  {customConfig.customMessage}
                </div>
              </div>
            )}

            <div className="flex gap-6 h-full">
              {/* Right Column */}
              <div className="flex flex-col gap-3 flex-shrink-0" style={{ width: sideWidth, paddingBottom: `${60 * screenScale}px` }}>
                {shouldShow('showCircle') && !todaySchedule.hideInternalCircle && !currentWorkshop?.hideInternalCircle && (
                  <InternalCircle 
                    names={currentCircleNames}
                    screenScale={screenScale * blockTextScale}
                    displayMode={todaySchedule.circleDisplayMode || 'all'}
                  />
                )}
                {shouldShow('showGroups') && !todaySchedule.hideSmallGroups && !currentWorkshop?.hideSmallGroups && (
                  <SmallGroups 
                    groups={todaySchedule.smallGroups || []}
                    rotationSeconds={systemSettings.groupRotationSeconds || 8}
                    screenScale={screenScale * blockTextScale}
                  />
                )}
                {shouldShow('showDutyPerson') && (
                  <DutyPerson 
                    name={todaySchedule.dutyPerson}
                    screenScale={screenScale * blockTextScale}
                  />
                )}
              </div>

              {/* Center Column */}
              <div className="flex-1 min-w-0 relative">
                <TimerOverlay screenScale={screenScale} fullScreenThresholdSeconds={timerFullScreenSeconds} centerOnly={true} />
                {displayMode === 'kickoff' && (
                  <KickoffMode
                    key="kickoff"
                    screenScale={screenScale}
                    onComplete={handleKickoffComplete}
                    kickoffConfig={systemSettings.kickoffConfig || {}}
                    centerOnly={true}
                  />
                )}
                {shouldShow('showNotices') && displayMode !== 'kickoff' && (
                  <NoticesGallery 
                    notices={todayNotices}
                    rotationSeconds={systemSettings.noticeRotationSeconds || 20}
                    screenScale={screenScale * noticeFontScale}
                    dualMode={systemSettings.dualNoticeMode || false}
                    cardOpacity={cardOpacity}
                  />
                )}
              </div>

              {/* Left Column */}
              <div className="flex flex-col gap-3 flex-shrink-0" style={{ width: sideWidth, paddingBottom: `${60 * screenScale}px` }}>
                {shouldShow('showCongrats') && (
                  <Congratulations 
                    items={todaySchedule.congratulations || []}
                    screenScale={screenScale * blockTextScale}
                  />
                )}
                {shouldShow('showRules') && (
                  <FixedRules 
                    rules={systemSettings.fixedRules || []}
                    screenScale={screenScale * blockTextScale}
                  />
                )}
                {shouldShow('showPhones') && phoneNumbers.filter(n => n.active !== false).length > 0 && (
                  <PhoneNumbers
                    numbers={phoneNumbers}
                    screenScale={screenScale * blockTextScale}
                  />
                )}
              </div>
            </div>
          </main>

          {shouldShow('showTicker') && (
            <Ticker 
              text={systemSettings.tickerText || `מח ולב | ${systemSettings.contactInfo || '072-2351290'} | ${systemSettings.operatingHours || 'ראשון-חמישי'}`}
              screenScale={screenScale * tickerFontScale}
            />
          )}
        </div>
      )}
    </div>
  );
}