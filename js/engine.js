(function()
{
    var Engine = function()
    {
        this.isStop = false;

        this.eventsManager = new spqr.EventsManager();
        this.inputManager = new spqr.InputManager();
    };

    Engine.method("setHeart", function(heart)
    {
        this.heart = heart;
    });

    Engine.method("createHeart", function(fps)
    {
        return this.heart ||
            window.requestAnimationFrame   ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback)
            {
                window.setTimeout(callback, 1000 / fps);
            };
    });

    Engine.method("setActiveScene", function(scene)
    {
        this.scene = scene;
    });

    Engine.method("run", function()
    {
        var self = this;
        var heart = this.createHeart(spqr.Context.config.fps);

        var fpsInterval = 1000 / spqr.Context.config.fps;
        var prevFrameDate = Date.now();
        var frameCount = 0;
        var frameCountStartDate = Date.now();

        this.inputManager.subscribe();
        this.inputManager.addListener({ctx: this, func: this.onInput});

        var heartBeat = function()
        {
            frameCount++;

            var now = Date.now();
            var elapsed = now - prevFrameDate;

            if (elapsed > fpsInterval)
            {
                prevFrameDate = now - (elapsed % fpsInterval);

                self.processEvents();
                self.draw();
            }

            if((now - frameCountStartDate) >= 1000)
            {
                frameCountStartDate = now;
                self.currentFPS = frameCount;
                frameCount = 0;

                var event = self.eventsManager.createEvent("fps.updated");
                self.eventsManager.pushEvent(event);
            }

            if(!this.isStop)
            {
                heart.call(window, heartBeat);
            }
            else
            {
                this.isStop = false;
            }
        };

        heart.call(window, heartBeat);
    });

    Engine.method("stop", function()
    {
        this.inputManager.removeListener(this.onInput);
        this.inputManager.unsubscribe();
        this.isStop = true;
    });

    Engine.method("onInput", function(actionName)
    {
        var event = this.eventsManager.createEvent(actionName);
        this.eventsManager.pushEvent(event);
    });

    Engine.method("processEvents", function()
    {
        var events = this.eventsManager.swap();
        if(this.scene)
        {
            this.scene.processEvents(events);
        }
    });

    Engine.method("draw", function()
    {
        if(this.scene)
        {
            this.scene.draw();
        }
    });

    spqr.Engine = Engine;
})();
