export interface Mapper<T, U> {
  to: (entity: T) => U
  from: (dto: U) => T
}
