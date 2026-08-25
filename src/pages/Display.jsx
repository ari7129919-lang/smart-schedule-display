import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabaseAPI } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

import Header from '@/components/display/Header';
import InternalCircle from '@/components/display/InternalCircle';
import SmallGroups from '@/components/display/SmallGroups';
import DutyPerson from '@/components/display/DutyPerson';
import NoticesGallery from '@/components/display/NoticesGallery';
import Congratulations from '@/components/display/Congratulations';
import FixedRules from '@/components/display/FixedRules';
import ScrollingTicker from '@/components/display/ScrollingTicker';
import KickoffMode from '@/components/display/KickoffMode';
import CalendarDisplay from '@/components/display/CalendarDisplay';
import UpcomingEvent from '@/components/display/UpcomingEvent';
import BreakMode from '@/components/display/BreakMode';
import { getUpcomingEvent } from '@/lib/calendarEvents';
import MotzeiMode from '@/components/display/MotzeiMode';
import TimerOverlay from '@/components/display/TimerOverlay';
import PhoneNumbers from '@/components/display/PhoneNumbers';
import BackgroundLayer from '@/components/display/BackgroundLayer';
import PopupOverlay from '@/components/display/PopupOverlay';
import useIsraelClock, { getIsraelSecondsSinceMidnight } from '@/hooks/useIsraelClock';

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

const KICKOFF_COUNTDOWN_SECONDS = 60;
const KICKOFF_STARTED_SECONDS = 180;
const KICKOFF_TOTAL_SECONDS = KICKOFF_COUNTDOWN_SECONDS + KICKOFF_STARTED_SECONDS;

const parseTimeToSeconds = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return (hours * 60 + minutes) * 60;
};

const getKickoffWindow = (workshop) => {
  if (!workshop?.kickoffEnabled) return null;
  const kickoffStart = parseTimeToSeconds(workshop.kickoffStartTime || workshop.startTime);
  if (kickoffStart === null) return null;
  return {
    start: kickoffStart,
    end: kickoffStart + KICKOFF_TOTAL_SECONDS,
  };
};

export default function Display({ previewMode = false, fitToScreen: _fitToScreen = false }) {
  const scheduleNow = useIsraelClock();
  const [displayMode, setDisplayMode] = useState('normal');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [breakDuration] = useState(10);
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
        queryClient.invalidateQueries(['calendarEvents']);
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
        queryClient.invalidateQueries(['calendarEvents']);
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
        queryClient.invalidateQueries(['calendarEvents']);
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

  const { data: tickerItems = [] } = useQuery({
    queryKey: ['tickerItems'],
    queryFn: () => supabaseAPI.find('TickerItem'),
    refetchInterval: 20000
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: () => supabaseAPI.find('CalendarEvent'),
    refetchInterval: 20000
  });

  const systemSettings = settings?.[0] || { screenProfile: '50' };
  // In preview mode, use smaller scale (0.20) to fit entire display board on laptop screen
  // In actual display mode, use the configured screen profile
  const screenScale = previewMode ? 0.20 : (screenScales[systemSettings.screenProfile] || 1);
  const customConfig = systemSettings.customModeConfig || {};
  const design = systemSettings.boardDesign || {};
  const isCustomTheme = design.themePreset === 'custom';
  const bgColor = isCustomTheme ? (design.bgColor || '#F4F5F7') : '#F4F5F7';
  const primaryColor = isCustomTheme ? (design.primaryColor || '#1A2B4C') : '#1A2B4C';
  const headerColor = isCustomTheme ? (design.headerColor || '#1A2B4C') : '#1A2B4C';
  const footerColor = isCustomTheme ? (design.footerColor || '#1A2B4C') : '#1A2B4C';
  const accentColor = isCustomTheme ? (design.accentColor || '#E6F4F4') : '#E6F4F4';
  const sideWidth = design.sideColumnWidth ? `${design.sideColumnWidth}%` : '22%';
  const noticeFontScale = parseFloat(design.noticeFontScale) || 1.0;
  const noticeContentScale = parseFloat(design.noticeContentScale) || 1.0;
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
      const baseSession = w.baseSession ?? w.currentSession ?? 1;
      const rawSession = baseSession + weeksPassed;
      const autoSession = w.noSessionLimit ? rawSession : Math.min(rawSession, w.totalSessions || 12);
      return { ...w, currentSession: autoSession };
    });
  }, [todaySchedule, systemSettings.pauseAllSessionAdvance]);

  // Get current workshop based on time
  const currentWorkshop = useMemo(() => {
    const currentTime = getIsraelSecondsSinceMidnight(scheduleNow);
    
    return workshopsWithAutoSession.find(w => {
      if (!w.startTime || !w.endTime) return false;
      const start = parseTimeToSeconds(w.startTime);
      const end = parseTimeToSeconds(w.endTime);
      const kickoffWindow = getKickoffWindow(w);
      const isDuringWorkshop = start !== null && end !== null && currentTime >= start && currentTime <= end;
      const isDuringKickoff = kickoffWindow && currentTime >= kickoffWindow.start && currentTime < kickoffWindow.end;
      return isDuringWorkshop || isDuringKickoff;
    });
  }, [workshopsWithAutoSession, scheduleNow]);

  const kickoffElapsedSeconds = useMemo(() => {
    const currentTime = getIsraelSecondsSinceMidnight(scheduleNow);
    const kickoffWindow = getKickoffWindow(currentWorkshop);
    if (!kickoffWindow || currentTime < kickoffWindow.start || currentTime >= kickoffWindow.end) return null;
    return currentTime - kickoffWindow.start;
  }, [currentWorkshop, scheduleNow]);

  const todayNotices = useMemo(() => {
    return (notices || [])
      .filter(n => {
        if (!n.active) return false;
        // Day filter
        if (n.days?.length > 0 && !n.days.includes(currentDayKey)) return false;
        // Workshop filter: if workshopNames is set, only show when current workshop matches
        if (n.workshopNames?.length > 0) {
          const currentName = currentWorkshop?.name;
          if (!currentName || !n.workshopNames.includes(currentName)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [notices, currentDayKey, currentWorkshop?.name]);

  const upcomingEvent = useMemo(() => getUpcomingEvent(calendarEvents, new Date()), [calendarEvents, scheduleNow]);
  const showUpcomingContent = systemSettings.upcomingEventEnabled !== false && !!upcomingEvent && Math.floor(scheduleNow.getTime() / 60000) % 2 === 1;

  // Rotate the calendar overlay independently from the scheduled display modes.
  useEffect(() => {
    if (systemSettings.calendarEnabled === false || calendarEvents.length === 0 || displayMode !== 'normal') {
      setCalendarVisible(false);
      return undefined;
    }
    let hideTimer;
    let showTimer;
    const showCalendar = () => {
      setCalendarVisible(true);
      hideTimer = setTimeout(() => setCalendarVisible(false), (systemSettings.calendarDurationSeconds || 20) * 1000);
      showTimer = setTimeout(showCalendar, (systemSettings.calendarRotationMinutes || 5) * 60 * 1000);
    };
    showTimer = setTimeout(showCalendar, (systemSettings.calendarRotationMinutes || 5) * 60 * 1000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [calendarEvents.length, displayMode, systemSettings.calendarEnabled, systemSettings.calendarDurationSeconds, systemSettings.calendarRotationMinutes]);

  // Calculate current circle list based on session number
  const currentCircleNames = useMemo(() => {
    const lists = todaySchedule.internalCircleLists || [];
    if (lists.length === 0) return [];

    // Rotate based on current session: session 1->group1, 2->group2, 3->group3, 4->group1, etc.
    const sessionNum = currentWorkshop?.currentSession || 1;
    const index = (sessionNum - 1) % lists.length;

    return lists[index] || [];
  }, [todaySchedule.internalCircleLists, currentWorkshop?.currentSession]);

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

    // Check for kickoff timing
    if (kickoffElapsedSeconds !== null) {
      setDisplayMode('kickoff');
      return;
    }

    setDisplayMode('normal');
  }, [systemSettings, kickoffElapsedSeconds]);

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
  const isFullBg = isCustomTheme && currentBg && currentBg.type !== 'none' && (currentBg.displayMode || 'full') === 'full';

  return (
    <div 
      className={previewMode ? "absolute inset-0 w-full h-full overflow-hidden" : "fixed inset-0 w-full h-full overflow-hidden"}
      style={{ 
        backgroundColor: isFullBg ? 'transparent' : bgColor,
        fontFamily: "'EFT_Hebrew', 'Heebo', 'system-ui', sans-serif",
        '--display-scale': screenScale
      }}
      dir="rtl"
    >
      {/* CSS Variables */}
      <style>{`
        :root {
          --primary: ${primaryColor};
          --secondary: #333333;
          --leaf: #5FAFA8;
          --bg: ${bgColor};
          --neutral: #D6DCE5;
          --accent: #5FAFA8;
          --board-navy: ${headerColor};
          --board-footer: ${footerColor};
          --board-section-bg: ${accentColor};
          --board-accent-strong: #5FAFA8;
          --board-card: #FFFFFF;
          --board-text: #333333;
          --board-shadow: 0 2px 6px rgba(0,0,0,0.08);
          --radius-lg: 4px;
          --shadow-soft: var(--board-shadow);
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

      {/* Popup overlay — above everything */}
      <PopupOverlay settings={systemSettings} screenScale={screenScale} />

      {/* Custom background layer — below everything */}
      {isCustomTheme && <BackgroundLayer settings={systemSettings} onCurrentBgChange={setCurrentBg} />}

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
              totalSessions={currentWorkshop?.totalSessions || 12}
              screenScale={screenScale}
              showProgress={displayMode !== 'custom' || customConfig.showProgress !== false}
              hideSessionText={currentWorkshop?.hideSessionText || false}
              hideProgressDots={currentWorkshop?.hideProgressDots || false}
              noSessionLimit={currentWorkshop?.noSessionLimit || false}
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
              padding: `${24 * screenScale}px`,
              paddingBottom: `${(80 + 24) * screenScale}px`
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

            <div className="flex h-full" style={{ gap: `${24 * screenScale}px` }}>
              {/* Right Column */}
              <div className="flex flex-col flex-shrink-0" style={{ width: sideWidth, gap: `${24 * screenScale}px` }}>
                {shouldShow('showCircle') && !todaySchedule.hideInternalCircle && !currentWorkshop?.hideInternalCircle && (
                  <InternalCircle
                    names={currentCircleNames}
                    screenScale={screenScale * blockTextScale}
                    displayMode={todaySchedule.circleDisplayMode || 'all'}
                    highlightBgColor={design.circleHighlightBg || '#8FAE9B'}
                    highlightTextColor={design.circleHighlightText || '#1B2A4A'}
                    animationType={design.circleAnimationType || 'pulse'}
                    animationSpeed={design.circleAnimationSpeed || 'normal'}
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
                    name={currentWorkshop?.dutyPerson || todaySchedule.dutyPerson}
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
                    elapsedSeconds={kickoffElapsedSeconds || 0}
                    centerOnly={true}
                  />
                )}
                {shouldShow('showNotices') && displayMode !== 'kickoff' && !calendarVisible && (
                  <NoticesGallery 
                    notices={todayNotices}
                    rotationSeconds={systemSettings.noticeRotationSeconds || 20}
                    screenScale={screenScale * noticeFontScale}
                    noticeFontScale={noticeFontScale}
                    noticeContentScale={noticeContentScale}
                    dualMode={systemSettings.dualNoticeMode || false}
                  />
                )}
                {calendarVisible && displayMode === 'normal' && (
                  <CalendarDisplay
                    events={calendarEvents}
                    upcomingEvent={upcomingEvent}
                    screenScale={screenScale * noticeFontScale}
                    rotationSeconds={systemSettings.calendarCellRotationSeconds || 6}
                  />
                )}
              </div>

              {/* Left Column */}
              <div className="flex flex-col flex-shrink-0" style={{ width: sideWidth, gap: `${24 * screenScale}px` }}>
                {shouldShow('showCongrats') && showUpcomingContent ? (
                  <UpcomingEvent event={upcomingEvent} screenScale={screenScale * blockTextScale} />
                ) : shouldShow('showCongrats') && (
                  <Congratulations
                    items={todaySchedule.congratulations || []}
                    screenScale={screenScale * blockTextScale}
                    ctaEnabled={systemSettings.congratsCTAEnabled || false}
                    ctaText={systemSettings.congratsCTAText || ''}
                    ctaLink={systemSettings.congratsCTALink || ''}
                    rotationSeconds={systemSettings.congratsRotationSeconds || 60}
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

          <ScrollingTicker 
            items={tickerItems}
            screenScale={screenScale * tickerFontScale}
            tickerEnabled={shouldShow('showTicker') && (systemSettings.tickerEnabled ?? true)}
            fallbackText={systemSettings.tickerText || `מח ולב | ${systemSettings.contactInfo || '072-2351290'} | ${systemSettings.operatingHours || 'ראשון-חמישי'}`}
          />
        </div>
      )}
    </div>
  );
}
