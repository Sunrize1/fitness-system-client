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