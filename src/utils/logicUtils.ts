import { TOPIC_BANK } from '../constants/topicBank';

export const getWednesdayOfWeek = (dateString: string): Date => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 is Sunday, 3 is Wednesday
  const diff = (day <= 3 ? 3 - day : 10 - day);
  const wednesday = new Date(date);
  wednesday.setDate(date.getDate() + diff);
  return wednesday;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateTopics = (numWeeks: number): string[] => {
  const shuffledEarly = shuffleArray(TOPIC_BANK.EARLY);
  const shuffledMid = shuffleArray(TOPIC_BANK.MID);
  const shuffledEnd = shuffleArray(TOPIC_BANK.END);

  const topics: string[] = [];
  for (let i = 0; i < numWeeks; i++) {
    const progress = i / (numWeeks - 1 || 1);
    let pool: string[];
    
    if (progress < 0.33) {
      pool = shuffledEarly;
    } else if (progress < 0.66) {
      pool = shuffledMid;
    } else {
      pool = shuffledEnd;
    }

    // Pick sequentially from the pool, looping if necessary (though prompt says zero repetitions, 
    // we should handle if numWeeks > pool size)
    const poolIndex = i % pool.length;
    topics.push(pool[i] || pool[poolIndex]);
  }
  return topics;
};
