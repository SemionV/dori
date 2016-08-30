define(['context', 'primitives', 'render', 'stateMachine', 'input', 'events'],
    function(context, primitives, render, states, input, eventsModel){
    class Component{
        constructor(name = null){
            this.name = name;
        }
    }

    class StateComponent extends Component{
        constructor(name = null){
            super(name);
        }

        update(entity, events){

        }
    }

    class RenderingComponent extends Component{
        constructor(name = null){
            super(name);
        }

        render(entity, renderer){

        }
    }

    class PositionComponent extends Component{
        constructor(transformation = new primitives.Matrix3D()){
            super();
            this.transformation = transformation;
        }
    }

    class CameraComponent extends Component{
        constructor(renderer){
            super();
            this.renderer = renderer;
        }
    }

    class PointDrawer extends RenderingComponent{
        constructor(color = new primitives.Color(0, 0, 0), drawPointer = true){
            super();
            this.color = color;
            this.drawPointer = drawPointer;
        }

        render(entity, renderer){
            renderer.addPrimitive(new render.Point(new primitives.Point3D(), this.color, this.drawPointer));
        }
    }

    class SpriteComponent extends Component{
        constructor(image){
            super();
            this.image = image;
        }
    }

    class SpriteDrawer extends RenderingComponent{
        constructor(drawBorder = false, color = new primitives.Color(0, 0, 0)){
            super();
            this.color = color;
            this.drawBorder = drawBorder;
            this.spritePrimitive = new render.Sprite(null, null, this.drawBorder, this.color);
        }

        render(entity, renderer){
            var sprite = entity.getComponent(SpriteComponent);
            if(sprite && sprite.image){
                this.spritePrimitive.image = sprite.image;
                renderer.addPrimitive(this.spritePrimitive);
            }
        }
    }

    class MeshComponent extends Component{
        constructor(name, mesh){
            super(name);
            this.mesh = mesh;
        }
    }

    class MeshDrawer extends RenderingComponent{
        constructor(meshComponent, wireFrame = true){
            super();
            this.meshComponent = meshComponent;
            this.wireFrame = wireFrame;
        }

        render(entity, renderer){
            if(this.meshComponent){
                var mesh = this.meshComponent.mesh;
                if(mesh){
                    for(let polygon of mesh.polygons){
                        renderer.addPrimitive(new render.Polygon(polygon, polygon[0].color, this.wireFrame));
                    }
                }
            }
        }
    }

    class BoundingVolumeComponent extends MeshComponent{
        constructor(mesh){
            super(null, mesh);
        }
    }

    class BoundingBoxComponent extends BoundingVolumeComponent{
        constructor(box){
            super();
            this.box = box;
        }
    }

    class BoundingBoxBackDrawer extends RenderingComponent{
        render(entity, renderer){
            var boundingBox = entity.getComponent(BoundingBoxComponent);

            if(boundingBox){
                var box = boundingBox.box;
                if(box){
                    let halfWidth = box.width / 2;
                    let halfHeight = box.height / 2;

                    let backColor = new primitives.Color(100, 100, 100, 1);

                    let vertex1 = new primitives.Vertex(-halfWidth, -halfHeight, 0);
                    let vertex2 = new primitives.Vertex(box.width - halfWidth, -halfHeight, 0);
                    let vertex3 = new primitives.Vertex(box.width - halfWidth, box.height - halfHeight, 0);
                    let vertex4 = new primitives.Vertex(0 - halfWidth, box.height - halfHeight, 0);

                    let vertex5 = new primitives.Vertex(vertex1.x, vertex1.y, -box.altitude);
                    let vertex6 = new primitives.Vertex(vertex2.x, vertex2.y, -box.altitude);
                    let vertex7 = new primitives.Vertex(vertex3.x, vertex3.y, -box.altitude);
                    let vertex8 = new primitives.Vertex(vertex4.x, vertex4.y, -box.altitude);

                    var polygon1 = new primitives.Polygon(vertex1, vertex4, vertex3, vertex2);//bottom
                    renderer.addPrimitive(new render.Polygon(polygon1, backColor, this.wireFrame));

                    var polygon2 = new primitives.Polygon(vertex1, vertex2, vertex6, vertex5);
                    renderer.addPrimitive(new render.Polygon(polygon2, backColor, this.wireFrame));

                    var polygon5 = new primitives.Polygon(vertex4, vertex1, vertex5, vertex8);
                    renderer.addPrimitive(new render.Polygon(polygon5, backColor, this.wireFrame));
                }
            }
        }
    }

    class BoundingBoxFrontDrawer extends RenderingComponent{
        render(entity, renderer){
            var boundingBox = entity.getComponent(BoundingBoxComponent);

            if(boundingBox){
                var box = boundingBox.box;
                if(box){
                    let halfWidth = box.width / 2;
                    let halfHeight = box.height / 2;

                    let topSideColor = new primitives.Color(255, 0, 0, 1);
                    let leftSideColor = new primitives.Color(0, 255, 0, 1);
                    let frontSideColor = new primitives.Color(0, 0, 255, 1);

                    let vertex1 = new primitives.Vertex(-halfWidth, -halfHeight, 0);
                    let vertex2 = new primitives.Vertex(box.width - halfWidth, -halfHeight, 0);
                    let vertex3 = new primitives.Vertex(box.width - halfWidth, box.height - halfHeight, 0);
                    let vertex4 = new primitives.Vertex(0 - halfWidth, box.height - halfHeight, 0);

                    let vertex5 = new primitives.Vertex(vertex1.x, vertex1.y, -box.altitude);
                    let vertex6 = new primitives.Vertex(vertex2.x, vertex2.y, -box.altitude);
                    let vertex7 = new primitives.Vertex(vertex3.x, vertex3.y, -box.altitude);
                    let vertex8 = new primitives.Vertex(vertex4.x, vertex4.y, -box.altitude);

                    var polygon3 = new primitives.Polygon(vertex2, vertex3, vertex7, vertex6);//front
                    renderer.addPrimitive(new render.Polygon(polygon3, frontSideColor, this.wireFrame));

                    var polygon4 = new primitives.Polygon(vertex3, vertex4, vertex8, vertex7);//left
                    renderer.addPrimitive(new render.Polygon(polygon4, leftSideColor, this.wireFrame));

                    var polygon6 = new primitives.Polygon(vertex5, vertex6, vertex7, vertex8);//top
                    renderer.addPrimitive(new render.Polygon(polygon6, topSideColor, this.wireFrame));
                }
            }
        }
    }

    class DirectionComponent extends Component{
        constructor(vector = new primitives.Point3D(1, 0, 0)){
            super();
            this.direction = vector;
        }
    }

    class MoveStartEvent extends eventsModel.Event{
    }

    class MoveEndEvent extends eventsModel.Event{
    }

    class StandingState extends states.State{
        update(events){
            if(events.hasEvent(MoveStartEvent)){
                return new MovingState();
            }

            return super.update(events);
        }
    }

    class MovingState extends states.State{
        update(events){
            if(events.hasEvent(MoveEndEvent)){
                return null;
            }

            return super.update(events);
        }
    }

    class ControllerComponent extends StateComponent{
        constructor(){
            super();
            this.moveState = new states.StateStack();
            this.moveState.push(new StandingState());
            this.direction = new primitives.Point3D();
        }
    }

    class KeyboardControllerComponent extends ControllerComponent{
        constructor(direction = new Point3D(-1, -1, 0)){
            super();
            this.axis = direction;
        }

        update(entity, events){
            if(events.hasEvents(input.KeydownEvent, input.KeyupEvent)){
                var inputManager = context.engine.inputManager;

                var left = inputManager.getKeyState("left");
                var right = inputManager.getKeyState("right");
                var top = inputManager.getKeyState("up");
                var bottom = inputManager.getKeyState("down");
                var moveDirection = null;

                if (!left && !bottom && !right && top) {
                    moveDirection = new primitives.Point2D(this.axis.x, this.axis.y);//NW
                }
                else if (left && !bottom && !right && !top) {
                    moveDirection = new primitives.Point2D(this.axis.x, this.axis.y).perpendicular();//SW
                }
                else if (left && !bottom && !right && top) {
                    moveDirection = new primitives.Point2D(this.axis.x, this.axis.y).rotate45DegreesNormal();//W
                }
                else if (left && bottom && !right && !top) {
                    moveDirection = new primitives.Point2D(this.axis.x, this.axis.y).perpendicular().rotate45DegreesNormal();//S
                }
                else if (!left && !bottom && right && top) {
                    moveDirection = new primitives.Point2D(this.axis.x, this.axis.y).inverse().perpendicular().rotate45DegreesNormal();//N
                }
                else if (!left && bottom && right && !top) {
                    moveDirection = new primitives.Point2D(this.axis.x, this.axis.y).inverse().rotate45DegreesNormal();//E
                }
                else if (!left && bottom && !right && !top) {
                    moveDirection = new primitives.Point2D(this.axis.x, this.axis.y).inverse();//SE
                }
                else if (!left && !bottom && right && !top) {
                    moveDirection = new primitives.Point2D(this.axis.x, this.axis.y).inverse().perpendicular();//NE
                }

                let eventsSet = new eventsModel.EventsSet();
                if (moveDirection) {
                    eventsSet.add(new MoveStartEvent());
                    var directionComponent = entity.getComponent(DirectionComponent);
                    if(directionComponent){
                        this.direction = new primitives.Point3D(moveDirection.x, moveDirection.y, 0);
                    }
                }
                else {
                    eventsSet.add(new MoveEndEvent());
                }

                this.moveState.update(eventsSet);
            }
        }
    }

    class MovementComponent extends StateComponent{
        constructor(speed){
            super();
            this.speed = speed;
            this.ds = parseFloat(((speed / 1000) * context.engine.updateDeltaTime).toFixed(2));
            this.vector = new primitives.Point3D();
            this.translate = new primitives.Matrix3D();
        }

        update(entity, events){
            var controllerComponent = entity.getComponent(ControllerComponent);
            var positionComponent = entity.getComponent(PositionComponent);
            if(controllerComponent && positionComponent)
            {
                var state = controllerComponent.moveState.getState();
                if(state instanceof MovingState)
                {
                    controllerComponent.direction.multiply(this.ds, this.vector);
                    primitives.Matrix3D.translate(this.vector.x, this.vector.y, this.vector.z, this.translate);
                    this.translate.multiply(positionComponent.transformation, positionComponent.transformation);
                }
            }
        }
    }

    class SpinComponent extends  StateComponent{
        constructor(a, b, g){
            super();
            this.da = parseFloat(((a / 1000) * context.engine.updateDeltaTime).toFixed(5));
            this.db = parseFloat(((b / 1000) * context.engine.updateDeltaTime).toFixed(5));
            this.dg = parseFloat(((g / 1000) * context.engine.updateDeltaTime).toFixed(5));

            this.rotateA = new primitives.Matrix3D();
            primitives.Matrix3D.rotateX(this.da, this.rotateA);
            this.rotateB = new primitives.Matrix3D();
            primitives.Matrix3D.rotateY(this.db, this.rotateB);
            this.rotateG = new primitives.Matrix3D();
            primitives.Matrix3D.rotateZ(this.dg, this.rotateG);
        }

        update(entity, events){
            var positionComponent = entity.getComponent(PositionComponent);
            if(positionComponent)
            {
                var transformation = positionComponent.transformation;
                if(this.da) {
                    this.rotateA.multiply(transformation, transformation);
                }
                if(this.db) {
                    this.rotateB.multiply(transformation, transformation);
                }
                if(this.dg) {
                    this.rotateG.multiply(transformation, transformation);
                }
            }
        }
    }

    return {
        Component,
        StateComponent,
        RenderingComponent,
        PositionComponent,
        CameraComponent,
        PointDrawer,
        SpriteComponent,
        SpriteDrawer,
        MeshComponent,
        MeshDrawer,
        BoundingVolumeComponent,
        BoundingBoxComponent,
        BoundingBoxBackDrawer,
        BoundingBoxFrontDrawer,
        DirectionComponent,
        KeyboardControllerComponent,
        MovementComponent,
        SpinComponent
    };
});
