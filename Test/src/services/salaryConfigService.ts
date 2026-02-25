import api from './api';

export type DefaultStatus = 'ACTIVE' | 'INACTIVE';

export interface SalaryConfig {
    id: string;
    code: string;
    name: string;
    status: DefaultStatus;

    // Cycle Configuration
    cycleStartDay: number; // e.g., 26 (of previous month)
    cycleEndDay: number;   // e.g., 27 (of current month)

    // Working Calendar
    workingDaysOfWeek: string[];
    excludedDaysOfWeek: string[];
    startTime: string; // '09:00'
    endTime: string;   // '18:00'
    breakMinutes: number;

    // Optional company-specific holidays (ISO date strings: 'YYYY-MM-DD')
    companyHolidays?: string[];

    // Standard monthly totals (calculated for the current cycle)
    standardWorkingDays: number;
    standardWorkingHours: number;
    standardWorkingMinutes: number;

    // Editable Formulas (stored as descriptive strings)
    formulaDay: string;
    formulaHour: string;
    formulaMinute: string;
}

// ---------------------------------------------------------------------------
// VIETNAMESE PUBLIC HOLIDAYS 2026 (Labour Law + compensation days)
// Compensation rule: if holiday falls on weekend → next Monday is substitute
// ---------------------------------------------------------------------------

/**
 * Format a Date to 'YYYY-MM-DD' string (local time)
 */
function toYMD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Returns the compensation date for a holiday if it falls on a weekend.
 * - Saturday  → following Monday
 * - Sunday    → following Monday (unless Saturday is also holiday → Tuesday)
 * Returns null if the holiday is already on a weekday.
 */
function compensationDate(d: Date): Date | null {
    const dow = d.getDay(); // 0 = Sun, 6 = Sat
    if (dow === 6) {
        // Saturday → +2 days (Monday)
        const c = new Date(d);
        c.setDate(c.getDate() + 2);
        return c;
    }
    if (dow === 0) {
        // Sunday → +1 day (Monday)
        const c = new Date(d);
        c.setDate(c.getDate() + 1);
        return c;
    }
    return null;
}

/**
 * Build the full set of official Vietnamese holidays for a given year.
 * Includes base holidays + compensation days when they fall on weekends.
 *
 * Lunar dates for Tet 2026 (Year of the Horse – Bính Ngọ):
 *   Tet holiday: 16/02/2026 – 20/02/2026 (5 days)
 *   Hung Kings: 25/04/2026
 * Government may adjust; these are best estimates per Labour Code 2019.
 */
function getOfficialHolidaysForYear(year: number): Set<string> {
    const dates: Set<string> = new Set();

    const addHoliday = (d: Date) => {
        const key = toYMD(d);
        dates.add(key);
        // Add compensation day if weekend
        const comp = compensationDate(d);
        if (comp) {
            dates.add(toYMD(comp));
        }
    };

    if (year === 2026) {
        // 1. Tết Dương lịch (New Year's Day): 01/01
        addHoliday(new Date(2026, 0, 1));

        // 2. Tết Âm lịch 2026 (Bính Ngọ): 16/02 – 20/02 (5 days official)
        for (let d = 14; d <= 20; d++) {
            addHoliday(new Date(2026, 1, d)); // 14–20 Feb (incl. eve days per decree)
        }
        // Official 5 paid days: 16–20 Feb 2026 (30 Tết – Mùng 4 Tết)

        // 3. Giỗ Tổ Hùng Vương: 10/3 âm → 25/04/2026 dương
        addHoliday(new Date(2026, 3, 25));

        // 4. Ngày Giải phóng miền Nam: 30/04
        addHoliday(new Date(2026, 3, 30));

        // 5. Quốc tế Lao động: 01/05
        addHoliday(new Date(2026, 4, 1));

        // 6. Quốc khánh: 02/09 (+ 03/09 per recent government announcements)
        addHoliday(new Date(2026, 8, 2));
        addHoliday(new Date(2026, 8, 3));
    } else {
        // Generic rules for other years (approximate – no lunar calendar lookup)
        addHoliday(new Date(year, 0, 1));   // Tết Dương lịch
        addHoliday(new Date(year, 3, 30));  // Giải phóng miền Nam
        addHoliday(new Date(year, 4, 1));   // Quốc tế Lao động
        addHoliday(new Date(year, 8, 2));   // Quốc khánh
    }

    return dates;
}

// Cache so we don't rebuild the set on every keystroke
const _holidayCache: Record<number, Set<string>> = {};
function getHolidaySet(year: number): Set<string> {
    if (!_holidayCache[year]) {
        _holidayCache[year] = getOfficialHolidaysForYear(year);
    }
    return _holidayCache[year];
}

// ---------------------------------------------------------------------------
// CYCLE RANGE
// ---------------------------------------------------------------------------

/**
 * Get the exact date range for a given payroll month/year.
 * Convention:
 *   startDate = day `startDay` of the PREVIOUS month (T-1)
 *   endDate   = day `endDay`   of the CURRENT  month (T)
 *
 * Example: tháng 02/2026, startDay=26, endDay=27
 *   → 26/01/2026 … 27/02/2026
 */
export function getCycleRange(
    month: number,
    year: number,
    startDay: number,
    endDay: number
) {
    // month is 1-based (1 = January)
    // Start: previous month
    const startDate = new Date(year, month - 2, startDay); // month-2 because Date months are 0-based
    // End: current month
    const endDate = new Date(year, month - 1, endDay);

    return { startDate, endDate };
}

// ---------------------------------------------------------------------------
// WORKING DAY CALCULATOR
// ---------------------------------------------------------------------------

const DAY_NAME_MAP: Record<number, string> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
};

/**
 * Count standard working days between startDate and endDate (inclusive).
 *
 * A day is counted if:
 *   1. Its weekday is in `workingDays` (e.g., ['MONDAY',...,'FRIDAY'])
 *   2. It is NOT in the official Vietnamese holiday set
 *   3. It is NOT in `companyHolidays` (user-defined ISO date strings)
 */
function calculateStandardDaysFromRange(
    startDate: Date,
    endDate: Date,
    workingDays: string[],
    companyHolidays: string[] = []
): number {
    if (!startDate || !endDate || !workingDays?.length) return 0;
    if (startDate > endDate) return 0;

    const companySet = new Set(companyHolidays);

    // Collect all years covered by the range to build holiday sets
    const yearsNeeded = new Set<number>();
    for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
        yearsNeeded.add(y);
    }
    // Merge holiday sets for all years in range
    const allHolidays = new Set<string>();
    yearsNeeded.forEach(y => {
        getHolidaySet(y).forEach(d => allHolidays.add(d));
    });

    let count = 0;
    const curr = new Date(startDate);

    while (curr <= endDate) {
        const dayName = DAY_NAME_MAP[curr.getDay()];
        const ymd = toYMD(curr);

        const isWorkingWeekday = workingDays.includes(dayName);
        const isPublicHoliday = allHolidays.has(ymd);
        const isCompanyHoliday = companySet.has(ymd);

        if (isWorkingWeekday && !isPublicHoliday && !isCompanyHoliday) {
            count++;
        }

        curr.setDate(curr.getDate() + 1);
    }

    return count;
}

// ---------------------------------------------------------------------------
// MAIN EXPORT: calculateSalaryRates
// ---------------------------------------------------------------------------

export function calculateSalaryRates(
    baseSalary: number,
    config: Partial<SalaryConfig>,
    simulationDate?: { month: number; year: number }
) {
    const empty = {
        standardWorkingDays: 0,
        standardWorkingHours: 0,
        standardWorkingMinutes: 0,
        salaryPerDay: 0,
        salaryPerHour: 0,
        salaryPerMinute: 0,
        startDate: null as Date | null,
        endDate: null as Date | null,
    };

    if (!config) return empty;

    const now = new Date();
    const month = simulationDate?.month ?? (now.getMonth() + 1);
    const year = simulationDate?.year ?? now.getFullYear();

    const { startDate, endDate } = getCycleRange(
        month,
        year,
        config.cycleStartDay ?? 26,
        config.cycleEndDay ?? 27
    );

    const days = calculateStandardDaysFromRange(
        startDate,
        endDate,
        config.workingDaysOfWeek ?? [],
        config.companyHolidays ?? []
    );

    const startTime = config.startTime ?? '09:00';
    const endTime = config.endTime ?? '18:00';
    const breakMinutes = config.breakMinutes ?? 0;

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const workingMinutesPerDay = Math.max(0, (endMins - startMins) - breakMinutes);
    const hoursPerDay = workingMinutesPerDay / 60;

    const totalHours = days * hoursPerDay;
    const totalMinutes = totalHours * 60;

    return {
        standardWorkingDays: days,
        standardWorkingHours: totalHours,
        standardWorkingMinutes: totalMinutes,
        salaryPerDay: days > 0 ? baseSalary / days : 0,
        salaryPerHour: totalHours > 0 ? baseSalary / totalHours : 0,
        salaryPerMinute: totalMinutes > 0 ? baseSalary / totalMinutes : 0,
        startDate,
        endDate,
    };
}

// ---------------------------------------------------------------------------
// SERVICE (API calls)
// ---------------------------------------------------------------------------

export const salaryConfigService = {
    async getAll(): Promise<SalaryConfig[]> {
        const response = await api.get('/salary-configs');
        const configs = response.data;

        return configs.map((cfg: SalaryConfig) => {
            const rates = calculateSalaryRates(10_000_000, cfg);
            return {
                ...cfg,
                standardWorkingDays: rates.standardWorkingDays,
                standardWorkingHours: rates.standardWorkingHours,
                standardWorkingMinutes: rates.standardWorkingMinutes,
            };
        });
    },

    async create(
        data: Omit<SalaryConfig, 'id' | 'standardWorkingDays' | 'standardWorkingHours' | 'standardWorkingMinutes'>
    ): Promise<SalaryConfig> {
        const response = await api.post('/salary-configs', data);
        const newConfig = response.data;
        const rates = calculateSalaryRates(10_000_000, newConfig);

        return {
            ...newConfig,
            standardWorkingDays: rates.standardWorkingDays,
            standardWorkingHours: rates.standardWorkingHours,
            standardWorkingMinutes: rates.standardWorkingMinutes,
        };
    },

    async update(id: string, data: Partial<SalaryConfig>): Promise<SalaryConfig> {
        const response = await api.put(`/salary-configs/${id}`, data);
        const updatedConfig = response.data;
        const rates = calculateSalaryRates(10_000_000, updatedConfig);

        return {
            ...updatedConfig,
            standardWorkingDays: rates.standardWorkingDays,
            standardWorkingHours: rates.standardWorkingHours,
            standardWorkingMinutes: rates.standardWorkingMinutes,
        };
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/salary-configs/${id}`);
    },
};
