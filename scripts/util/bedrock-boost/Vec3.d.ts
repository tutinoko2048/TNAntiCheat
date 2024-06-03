import { Vector3, Direction } from "@minecraft/server";
export declare class Vec3 implements Vector3 {
    static readonly Zero: Vec3;
    static readonly Down: Vec3;
    static readonly Up: Vec3;
    static readonly North: Vec3;
    static readonly South: Vec3;
    static readonly East: Vec3;
    static readonly West: Vec3;
    readonly x: number;
    readonly y: number;
    readonly z: number;
    constructor(x: number, y: number, z: number);
    constructor(x: Vec3);
    constructor(x: Vector3);
    constructor(x: Direction);
    constructor(x: number[]);
    /**
     * Creates a new vector from the given values.
     */
    static from(x: number, y: number, z: number): Vec3;
    static from(x: Vec3): Vec3;
    static from(x: Vector3): Vec3;
    static from(x: Direction): Vec3;
    static from(x: number[]): Vec3;
    private static _from;
    /**
     * Creates a copy of the current vector.
     *
     * @returns A new vector with the same values as the current vector.
     */
    copy(): Vec3;
    /**
     * Creates a new direction vector from yaw and pitch values.
     *
     * @param yaw - The yaw value in degrees.
     * @param pitch - The pitch value in degrees.
     * @returns A new vector representing the direction.
     */
    static fromYawPitch(yaw: number, pitch: number): Vec3;
    /**
     * Adds another vector to the current vector.
     *
     * @param v - The vector to be added.
     * @returns The updated vector after addition.
     */
    add(x: number, y: number, z: number): Vec3;
    add(x: Vec3): Vec3;
    add(x: Vector3): Vec3;
    add(x: Direction): Vec3;
    add(x: number[]): Vec3;
    /**
     * Subtracts another vector from the current vector.
     *
     * @param v - The vector to be subtracted.
     * @returns The updated vector after subtraction.
     */
    subtract(x: number, y: number, z: number): Vec3;
    subtract(x: Vec3): Vec3;
    subtract(x: Vector3): Vec3;
    subtract(x: Direction): Vec3;
    subtract(x: number[]): Vec3;
    /**
     * Multiplies the current vector by another vector or scalar.
     *
     * @param v - The vector or scalar to multiply with.
     * @returns The updated vector after multiplication.
     */
    multiply(x: number, y: number, z: number): Vec3;
    multiply(x: Vec3): Vec3;
    multiply(x: Vector3): Vec3;
    multiply(x: Direction): Vec3;
    multiply(x: number[]): Vec3;
    multiply(x: number): Vec3;
    /**
     * Divides the current vector by another vector or scalar.
     *
     * @param v - The vector or scalar to divide by.
     * @returns The updated vector after division.
     */
    divide(x: number, y: number, z: number): Vec3;
    divide(x: Vec3): Vec3;
    divide(x: Vector3): Vec3;
    divide(x: Direction): Vec3;
    divide(x: number[]): Vec3;
    divide(x: number): Vec3;
    /**
     * Normalizes the vector to have a length (magnitude) of 1.
     * Normalized vectors are often used as a direction vectors.
     *
     * @returns The normalized vector.
     */
    normalize(): Vec3;
    /**
     * Computes the length (magnitude) of the vector.
     *
     * @returns The length of the vector.
     */
    length(): number;
    /**
     * Computes the squared length of the vector.
     * This is faster than computing the actual length and can be useful for comparison purposes.
     *
     * @returns The squared length of the vector.
     */
    lengthSquared(): number;
    /**
     * Computes the cross product of the current vector with another vector.
     *
     * A cross product is a vector that is perpendicular to both vectors.
     *
     * @param v - The other vector.
     * @returns A new vector representing the cross product.
     */
    cross(x: number, y: number, z: number): Vec3;
    cross(x: Vec3): Vec3;
    cross(x: Vector3): Vec3;
    cross(x: Direction): Vec3;
    cross(x: number[]): Vec3;
    /**
     * Computes the distance between the current vector and another vector.
     *
     * @param v - The other vector.
     * @returns The distance between the two vectors.
     */
    distance(x: number, y: number, z: number): number;
    distance(x: Vec3): number;
    distance(x: Vector3): number;
    distance(x: Direction): number;
    distance(x: number[]): number;
    /**
     * Computes the squared distance between the current vector and another vector.
     * This is faster than computing the actual distance and can be useful for comparison purposes.
     *
     * @param v - The other vector.
     * @returns The squared distance between the two vectors.
     */
    distanceSquared(x: number, y: number, z: number): number;
    distanceSquared(x: Vec3): number;
    distanceSquared(x: Vector3): number;
    distanceSquared(x: Direction): number;
    distanceSquared(x: number[]): number;
    /**
     * Computes the linear interpolation between the current vector and another vector, when t is in the range [0, 1].
     * Computes the extrapolation when t is outside this range.
     *
     * @param v - The other vector.
     * @param t - The interpolation factor.
     * @returns A new vector after performing the lerp operation.
     */
    lerp(v: Vector3, t: number): Vec3;
    /**
     * Computes the spherical linear interpolation between the current vector and another vector, when t is in the range [0, 1].
     * Computes the extrapolation when t is outside this range.
     *
     * @param v - The other vector.
     * @param t - The interpolation factor.
     * @returns A new vector after performing the slerp operation.
     */
    slerp(v: Vector3, t: number): Vec3;
    /**
     * Computes the dot product of the current vector with another vector.
     *
     * @param v - The other vector.
     * @returns The dot product of the two vectors.
     */
    dot(x: number, y: number, z: number): number;
    dot(x: Vec3): number;
    dot(x: Vector3): number;
    dot(x: Direction): number;
    dot(x: number[]): number;
    /**
     * Computes the angle (in radians) between the current vector and another vector.
     *
     * @param v - The other vector.
     * @returns The angle in radians between the two vectors.
     */
    angleBetween(x: number, y: number, z: number): number;
    angleBetween(x: Vec3): number;
    angleBetween(x: Vector3): number;
    angleBetween(x: Direction): number;
    angleBetween(x: number[]): number;
    /**
     * Computes the projection of the current vector onto another vector.
     * This method finds how much of the current vector lies in the direction of vector `v`.
     *
     * @param v - The vector onto which the current vector will be projected.
     * @returns A new vector representing the projection of the current vector onto `v`.
     */
    projectOnto(x: number, y: number, z: number): Vec3;
    projectOnto(x: Vec3): Vec3;
    projectOnto(x: Vector3): Vec3;
    projectOnto(x: Direction): Vec3;
    projectOnto(x: number[]): Vec3;
    /**
     * Computes the reflection of the current vector against a normal vector.
     * Useful for simulating light reflections or bouncing objects.
     *
     * @param normal - The normal vector against which the current vector will be reflected.
     * @returns A new vector representing the reflection of the current vector.
     */
    reflect(x: number, y: number, z: number): Vec3;
    reflect(x: Vec3): Vec3;
    reflect(x: Vector3): Vec3;
    reflect(x: Direction): Vec3;
    reflect(x: number[]): Vec3;
    /**
     * Rotates the current normalized vector by a given angle around a given axis.
     *
     * @param axis - The axis of rotation.
     * @param angle - The angle of rotation in degrees.
     * @returns The rotated vector.
     */
    rotate(axis: Vector3, angle: number): Vec3;
    /**
     * Sets the X component of the vector.
     *
     * @param value - The new X value.
     * @returns The updated vector with the new X value.
     */
    setX(value: number): Vec3;
    /**
     * Sets the Y component of the vector.
     *
     * @param value - The new Y value.
     * @returns The updated vector with the new Y value.
     */
    setY(value: number): Vec3;
    /**
     * Sets the Z component of the vector.
     *
     * @param value - The new Z value.
     * @returns The updated vector with the new Z value.
     */
    setZ(value: number): Vec3;
    /**
     * Calculates the shortest distance between a point (represented by this Vector3 instance) and a line segment.
     *
     * This method finds the perpendicular projection of the point onto the line defined by the segment. If this
     * projection lies outside the line segment, then the method calculates the distance from the point to the
     * nearest segment endpoint.
     *
     * @param start - The starting point of the line segment.
     * @param end - The ending point of the line segment.
     * @returns The shortest distance between the point and the line segment.
     */
    distanceToLineSegment(start: Vector3, end: Vector3): number;
    /**
     * Floors the X, Y, and Z components of the vector.
     * @returns A new vector with the floored components.
     */
    floor(): Vec3;
    /**
     * Floors the X component of the vector.
     * @returns A new vector with the floored X component.
     */
    floorX(): Vec3;
    /**
     * Floors the Y component of the vector.
     * @returns A new vector with the floored Y component.
     */
    floorY(): Vec3;
    /**
     * Floors the Z component of the vector.
     * @returns A new vector with the floored Z component.
     */
    floorZ(): Vec3;
    /**
     * Ceils the X, Y, and Z components of the vector.
     * @returns A new vector with the ceiled components.
     */
    ceil(): Vec3;
    /**
     * Ceils the X component of the vector.
     * @returns A new vector with the ceiled X component.
     */
    ceilX(): Vec3;
    /**
     * Ceils the Y component of the vector.
     * @returns A new vector with the ceiled Y component.
     */
    ceilY(): Vec3;
    /**
     * Ceils the Z component of the vector.
     * @returns A new vector with the ceiled Z component.
     */
    ceilZ(): Vec3;
    /**
     * Rounds the X, Y, and Z components of the vector.
     * @returns A new vector with the rounded components.
     */
    round(): Vec3;
    /**
     * Rounds the X component of the vector.
     * @returns A new vector with the rounded X component.
     */
    roundX(): Vec3;
    /**
     * Rounds the Y component of the vector.
     * @returns A new vector with the rounded Y component.
     */
    roundY(): Vec3;
    /**
     * Rounds the Z component of the vector.
     * @returns A new vector with the rounded Z component.
     */
    roundZ(): Vec3;
    /**
     * Returns a new vector offset from the current vector up by 1 block.
     * @returns A new vector offset from the current vector up by 1 block.
     */
    up(): Vec3;
    /**
     * Returns a new vector offset from the current vector down by 1 block.
     * @returns A new vector offset from the current vector down by 1 block.
     */
    down(): Vec3;
    /**
     * Returns a new vector offset from the current vector north by 1 block.
     * @returns A new vector offset from the current vector north by 1 block.
     */
    north(): Vec3;
    /**
     * Returns a new vector offset from the current vector south by 1 block.
     * @returns A new vector offset from the current vector south by 1 block.
     */
    south(): Vec3;
    /**
     * Returns a new vector offset from the current vector east by 1 block.
     * @returns A new vector offset from the current vector east by 1 block.
     */
    east(): Vec3;
    /**
     * Returns a new vector offset from the current vector west by 1 block.
     * @returns A new vector offset from the current vector west by 1 block.
     */
    west(): Vec3;
    /**
     * Checks if the current vector is equal to the zero vector.
     * @returns true if the vector is equal to the zero vector, else returns false.
     */
    isZero(): boolean;
    /**
     * Converts the vector to an array containing the X, Y, and Z components of the vector.
     * @returns An array containing the X, Y, and Z components of the vector.
     */
    toArray(): number[];
    /**
     * Converts the vector to a direction.
     * If the vector is not a unit vector, then it will be normalized and rounded to the nearest direction.
     */
    toDirection(): Direction;
    /**
     * Checks if the current vector is equal to another vector.
     * @param other
     */
    equals(x: number, y: number, z: number): boolean;
    equals(x: Vec3): boolean;
    equals(x: Vector3): boolean;
    equals(x: Direction): boolean;
    equals(x: number[]): boolean;
    toString(): string;
}
