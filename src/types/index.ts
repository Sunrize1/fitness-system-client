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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDto {
  title: string;
  description: string;
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
  onDropExercise: (ex: any) => void;
  onDropApproach: (ap: any) => void;
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