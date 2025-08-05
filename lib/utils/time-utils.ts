import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatRelativeTime(dateString: string): string {
  // SQLite에서 오는 날짜 문자열을 UTC로 파싱
  const date = new Date(dateString);
  
  // 한국 시간대로 변환 (UTC + 9시간)
  const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  
  // 현재 시간도 한국 시간대로 조정
  const now = new Date();
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  
  // 시간 차이 계산
  const timeDiff = kstNow.getTime() - kstDate.getTime();
  
  // date-fns의 formatDistanceToNow는 현재 시간 기준으로 계산하므로
  // 수동으로 시간 차이를 계산하여 표시
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return '방금 전';
  } else if (minutes < 60) {
    return `${minutes}분 전`;
  } else if (hours < 24) {
    return `약 ${hours}시간 전`;
  } else if (days === 1) {
    return '어제';
  } else if (days < 7) {
    return `${days}일 전`;
  } else {
    // 7일 이상된 경우 date-fns 사용
    return formatDistanceToNow(kstDate, { addSuffix: true, locale: ko });
  }
}