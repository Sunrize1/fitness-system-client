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
  username: string;
  firstname: string;
  lastname: string;
  gender: 'MALE' | 'FEMALE';
  birthday?: string;
} 