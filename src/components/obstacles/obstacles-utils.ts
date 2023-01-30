import { Vector3 } from "three";

export interface IGetObstaclePositionParams {
    /**
     * Y position of upper obstacle.
     */
    upperObstacleY: number;
    /**
     * Obstacle height.
     */
    obstacleHeight: number;
    /**
     * Defines if the position must be generated for the upper or lower obstacle.
     */
    isUpperObstacle?: boolean;
    /**
     * Min and Max Y distance between the upper and lower obstacles.
     */
    yDistance: [number, number];
    /**
     * Z distance between obstacles.
     */
    zDistance: number;
    /**
     * Progressive position of the obstacle [1, 2, ..., N] to determine Z position.
     */
    position: number;
}

class ObstaclesUtils {
    getObstaclePosition = (params: IGetObstaclePositionParams): Vector3 => {
        const { upperObstacleY, obstacleHeight, isUpperObstacle, yDistance, zDistance, position } = params;

        // Random y distance between the obstacle based by yDistance[0] (MIN) and yDistance[1] (MAX)
        const obstacleDistance = (Math.random() * (yDistance[1] - yDistance[0])) + yDistance[0];

        const randomYPosition = isUpperObstacle ? upperObstacleY : upperObstacleY - obstacleHeight - obstacleDistance;

        return new Vector3(0, randomYPosition, (position + 1) * - zDistance);
    }

    generateUpperYPosition = () => (Math.random() * 10) + 22;
}

export const obstaclesUtils = new ObstaclesUtils();
