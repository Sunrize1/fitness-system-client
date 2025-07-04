export interface UserRegistrationDto {
  username: string;
  firstname: string;
  lastname: string;
  password: string;
  gender: 'MALE' | 'FEMALE';
}

export interface UserLoginDto {
  username: string;
  password: string;
}

export interface TokenDto {
  token: string;
}

export interface UserDto {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  gender: 'MALE' | 'FEMALE';
  userRole: 'ADMIN' | 'TRAINER' | 'DEFAULT_USER'
  birthday?: string;
  avatarBase64: string;
}

export interface GetPostsDto {
  page: number;
  size: number;
  sort?: string[];
}

export interface PostDto {
  id: number;
  title: string;
  description: string;
  imageBase64?: string;
  createdAt: number[] | string;
  updatedAt: number[] | string;
}

export interface CreatePostDto {
  title: string;
  description: string;
  imageBase64?: string;
}

export interface UpdatePostDto {
  title?: string;
  description?: string;
  imageBase64?: string;
}

export interface PostListDto {
  posts: PostDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLast: boolean;
}

export interface ApproachDto {
  id: number;
  approachesCount: number;
  repetitionPerApproachCount: number;
}

export interface ExerciseDto {
  id: number;
  title: string;
  description: string;
}

export interface FullExerciseDto {
  id: number;
  exerciseDto: ExerciseDto;
  approachDto: ApproachDto;
  trainMachineDto?: TrainMachineDto;
}

export interface FullExerciseListDto {
  fullExercises: FullExerciseDto[];
}

export interface DraggableApproachCardProps {
  approach: any;
  selected: boolean;
  isOverlay?: boolean;
  onDelete?: (approachId: number) => void;
}

export interface DraggableExerciseCardProps {
  exercise: any;
  selected: boolean;
  isOverlay?: boolean;
  onDelete?: (exerciseId: number) => void;
}

export interface FullExerciseListProps {
  fullExercises: FullExerciseDto[];
  onDelete?: (fullExerciseId: number) => void;
}

export interface FullExerciseDropzoneProps {
  selectedExercise: any | null;
  selectedApproach: any | null;
  selectedTrainMachine: TrainMachineDto | null;
  onDropExercise: (ex: any) => void;
  onDropApproach: (ap: any) => void;
  onDropTrainMachine: (tm: TrainMachineDto) => void;
  onCreate: () => void;
  onReset: () => void;
  creating: boolean;
  activeDragItem: any | null;
}

export interface UpdateProfile {
    firstname: string,
    lastname: string,
    gender: "MALE" | "FEMALE"
    birthday: string,
    avatarBase64: string
}


export interface CreateTrainingSessionDto {
  name: string;
  description?: string;
  type: 'GROUP' | 'PERSONAL';
  trainerId?: number;
  startTime: string;
  durationMinutes: number;
  maxParticipants?: number;
  gymRoomId: number;
}

export interface GymRoomShort {
  id: number;
  name: string;
  description?: string;
  longitude: number;
  latitude: number;
  capacity: number;
}

export interface TrainingSessionDto {
  id: number;
  name: string;
  description?: string;
  type: 'GROUP' | 'PERSONAL';
  trainer?: UserDto;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxParticipants?: number;
  currentParticipants: number;
  gymRoom: GymRoomShort;
  isFull: boolean;
  createdAt: string;
  updatedAt: string;
  fullExercises: FullExerciseDto[];
}

export interface TrainingSessionListDto {
  sessions: TrainingSessionDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLast: boolean;
}

export interface UpdateTrainingSessionDto {
  name?: string;
  description?: string;
  type?: 'GROUP' | 'PERSONAL';
  trainerId?: number;
  startTime?: string;
  durationMinutes?: number;
  maxParticipants?: number;
  location?: string;
}

export interface EnrollmentDto {
  id: number;
  userId: number;
  username: string;
  trainingSessionId: number;
  trainingSessionName: string;
  enrollmentTime: number[] | string;
  status: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED' | 'PENDING';
  enrollmentCallType: 'CLIENT' | 'TRAINER';
}

export interface EnrollmentListDto {
  enrollments: EnrollmentDto[];
}

export interface CoachAIRequestDto {
  message: string;
}

export interface CoachAIResponseDto {
  advice: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChangeUserRoleDto {
  userId: number;
  newRole: 'ADMIN' | 'TRAINER' | 'DEFAULT_USER';
}

export interface UserListDto {
  users: UserDto[];
}

// Subscription types
export interface SubscriptionDto {
  id: number;
  personalTrainingCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface SubscriptionExtensionRequest {
  days: number;
}

export interface PersonalTrainingPurchaseRequest {
  count: number;
}

// Subscription Specific types
export interface SubscriptionSpecificDto {
  id: number;
  name: string;
  description?: string;
  personalTrainingCount: number;
  subscriptionDaysCount: number;
}

export interface SubscriptionSpecificCreateDto {
  name: string;
  description?: string;
  personalTrainingCount: number;
  subscriptionDaysCount: number;
}

export interface SubscriptionSpecificListDto {
  subscriptions: SubscriptionSpecificDto[];
}

// Gym Room types
export interface GymRoomDto {
  id: number;
  name: string;
  description?: string;
  longitude: number;
  latitude: number;
  capacity: number;
  base64Image?: string;
  trainMachines: TrainMachineDto[];
}

export interface GymRoomCreateDto {
  name: string;
  description?: string;
  longitude: number;
  latitude: number;
  capacity: number;
  base64Image?: string;
}

export interface GymRoomUpdateDto {
  name?: string;
  description?: string;
  longitude?: number;
  latitude?: number;
  capacity?: number;
  base64Image?: string;
}

export interface GymRoomListDto {
  gymRooms: GymRoomDto[];
}

export interface TrainMachineDto {
  id: number;
  name: string;
  description?: string;
  base64Image?: string;
  count: number;
  gymRoomId: number;
}

export interface TrainMachineCreateDto {
  name: string;
  description?: string;
  base64Image?: string;
  count: number;
  gymRoomId: number;
}

export interface TrainMachineUpdateDto {
  name?: string;
  description?: string;
  base64Image?: string;
  count?: number;
}

export interface TrainMachineListDto {
  trainMachines: TrainMachineDto[];
}

// Statistics types
export interface UserStatisticsDto {
  totalRegisteredUsers: number;
  totalActiveUsers: number;
  usersCountByRole: Record<string, number>;
}

export interface NewRegistrationsPeriodDto {
  period: string;
  count: number;
}

export interface TrainingSessionStatisticsDto {
  totalScheduledTrainingSessions: number;
  completedTrainingSessions: number;
  activeTrainingSessions: number;
  upcomingTrainingSessions: number;
  popularTrainingTypes: Record<string, number>;
  averageParticipantsPerSession: number;
  maxParticipantsPerSession: number;
  busiestTrainersBySessionsCount: Record<string, number>;
}

export interface SubscriptionStatisticsDto {
  totalActiveSubscriptions: number;
  expiringSubscriptionsNextMonth: number;
  subscriptionsStartDateDistribution: Record<string, number>;
  subscriptionsEndDateDistribution: Record<string, number>;
}

export interface GymRoomStatisticsDto {
  popularGymRoomsByTrainingCount: Record<string, number>;
  totalMachinesByGymRoom: Record<string, number>;
  totalMachinesOverall: number;
}

export interface EnrollmentStatisticsDto {
  enrollmentsCountInPeriod: number;
  enrollmentsCountByStatus: Record<string, number>;
}

export interface StatisticsPeriodParams {
  period?: 'LAST_DAY' | 'LAST_WEEK' | 'LAST_MONTH' | 'ALL_TIME';
  startDate?: string;
  endDate?: string;
}