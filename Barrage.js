/**
 * 
 * @param {object} parm 
 * @param {node} node 
 */

function setStyle(parm, node) {
    var reg = /[A-Z]/g;
    var str = '';
    var keys = Object.keys(parm);
    keys.forEach(function (key) {
        str += `${reg.test(key) ? key.replace(reg, function() {return `-${arguments[0].toLowerCase()}`}) : key}: ${parm[key]};`;
    });
    node.style.cssText += str;
}

//observer

function ObserverList() {
    this.observerList = [];
}

ObserverList.prototype.add = function (Obs) {
    return this.observerList.push(Obs);
}

ObserverList.prototype.getLength = function () {
    return this.observerList.length;
}

ObserverList.prototype.getObserver = function (index) {
    if (index > -1 && index < this.observerList.length) {
        return this.observerList[index];
    }
}

ObserverList.prototype.indexOf = function (Obs, startIndex) {
    var i = startIndex;
    while (i < this.observerList.length) {
        if (this.observerList[i] === Obs) {
            return i;
        }
        i++;
    }
    return -1;
}


function Subject() {
    this.observers = new ObserverList();
}

Subject.prototype.addObserver = function (Obs) {
    this.observers.add(Obs);
}

Subject.prototype.removeObserver = function (Obs) {
    this.observers.removeAt(this.observers.indexOf(Obs, 0));
};

Subject.prototype.notify = function (ctx) {
    var length = this.observers.getLength();
    for (let i = 0; i < length; i++) {
        this.observers.getObserver(i).update(ctx);
    }
}

function Observer() {
    this.update = function () {

    }
}


//Bullet
var Bullet = function (data) {
    /**
     * @param{Number} time
     * @param{Number} type
     * @param{Node} bullet
     */
    this.type = data.type;
    this.time = data.ctime;
    this.message = data.content;
    this.fontSize = data.fontSize;
    this.color = data.color;

    var that = this;

    (function () {
        that.bullet = document.createElement('div');
        that.bullet.innerHTML = that.message;

        var parm = {
            whiteSpace: 'pre',
            userSelect: 'none',
            position: 'absolute',
            willChange: `${that.type == 0 ? 'transform' : 'opacity'}`,
            fontSize: `${that.fontSize == 0 ? '20px' : '25px'}`,
            fontFamily: 'SimHei, Arial, Helvtica, sans-serif',
            textShadow: '#000 1px 0 1px, #000 0 1px 1px, #000 0 -1px 1px, #000 -1px 0 1px',
            perspective: '500px',
            display: 'inline-block',
            fontWeight: 'blod',
            lineHeight: '1.125',
            opacity: 1,
            color: that.color,
            left: `${that.type !== 0 ? '50%' : '100%'}`,
            transform: `${that.type !== 0 ? 'translateX(-50%)' : ''}`
        }

        setStyle(parm, that.bullet);
    })()

}

Bullet.prototype.load = function (num, callback) {
    console.log('load', this.offsetLeft());
    var that = this;
    var vertical = num * 20;
    var offset = document.querySelector('#danmuContent').offsetWidth + this.bullet.offsetWidth;
    var second = this.bullet.offsetWidth * 5 / offset;
    var parm = {
        top: `${that.type !== 2 ? vertical + 'px' : ''}`,
        bottom: `${that.type == 2 ? vertical + 'px' : ''}`,
        transition: `${that.type == 0 ? 'transform 5s linear 0s' : ''}`,
        transform: `${that.type == 0 ? 'translateX(-' + offset + 'px)' : ''}`
    }


    setStyle(parm, this.bullet);
    
    window.setTimeout(function() {
        callback();
    }, second * 1000);
}


Bullet.prototype.remove = function () {
    delete this.bullet.parentElement.remove(this.bullet);
}

Bullet.prototype.offsetLeft = function () {
    return this.bullet.offsetLeft;
}

Bullet.prototype.offsetRight = function () {
    console.log(this.bullet.offsetLeft);
    return this.bullet.offsetRight;
}

Bullet.prototype.getTime = function () {
    return this.time;
}

Bullet.prototype.get = function () {
    return this.bullet;
}


var BulletList = function () {
    /**
     * @param{Object} list
     */
    var list = {};

    this.put = function (bullet) {
        var time = bullet.getTime();
        var index = Math.floor(time / 1000);

        if (typeof list[index] == 'undefined') {
            list[index] = []
        }

        list[index].push(bullet);
    }

    this.get = function (second) {
        return typeof list[second] == 'undefined' ? [] : list[second];
    }
}

//轨道类
var Track = function (num, owner) {
    this.trackNum = num;
    this.bulletList = [];
    this.subject = new Subject();
    this.owner = owner;
}

Track.prototype.close = function () {
    this.subject.notify({
        track: this.trackNum,
        state: 1
    });
    return this;
}

Track.prototype.open = function () {
    this.subject.notify({
        track: this.trackNum,
        state: 0
    })
    return this;
}


Track.prototype.loadBullet = function (bullet) {
    var that = this;
    this.close();
    this.owner.append(bullet.get());
    bullet.load(this.trackNum, function() {
        that.open();
    })
    this.bulletList.push(bullet);
    var that = this;
    this.timer = window.setInterval(function () {
        var offsetRight = bullet.offsetRight();
        if (offsetRight >= 0) {
            that.open();
        }
    }, 1000);
}

Track.prototype.addObserver = function (Obs) {
    this.subject.addObserver(Obs);
    this.open();
}


var Controller = function (target) {
    var tracklist = [];
    var waitlist = [];
    var callboard = {};
    var length = 0;

    var that = this;


    var observer = new Observer();
    observer.update = function (ctx) {
        var state = ctx.state;
        var trackNum = ctx.track;
    
        if(state) {
            delete callboard[trackNum];
            length--;
        } else{
            callboard[trackNum] = 0;
            length++;
            if(waitlist.length > 0) {
                that.addBullet(waitlist.pop());
            }
        }

        
    }



    this.addBullet = function (bullet) {
        if(length) {
            this.load(bullet);
        } else {
            waitlist.push(bullet);
            this.addTrack();
        }

    }

    this.addTrack = function () {
        var track = new Track(tracklist.length, target);
        tracklist.push(track);
        track.addObserver(observer);
    }

    this.load = function(bullet) {
        var index = getIndex();
        tracklist[index].loadBullet(bullet);
    }

    function getIndex() {
        return Object.keys(callboard)[0];
    }

}

var Main = function() {
    var data = [{
        ctime: 0,
        content: '第一条弹幕',
        type: 0,
        color: '#fff',
        fontSize: 0
    }, {
        ctime: 1,
        content: '测试第二tiao',
        type: 0,
        color: '#fff',
        fontSize: 0
    }, {
        ctime: 4021,
        content: '第三',
        type: 0,
        color: '#fff',
        fontSize: 0
    },{
        ctime: 2000,
        content: 'caoninaiani',
        type: 0,
        color: '#fff',
        fontSize: 1
    },{
        ctime: 600,
        content: '第三（真的）',
        type: 0,
        color: '#fff',
        fontSize: 0,
    }]

    var target = document.querySelector('#danmuContent');
    var roll = new Controller(target);
    var bulletlist = new BulletList();

    data.forEach(function(item) {
        var bullet = new Bullet(item);
        bulletlist.put(bullet);
    })

    var ctime = 0;
    var timer = window.setInterval(function() {
        var list = bulletlist.get(ctime);
        if(list.length > 0) {
            list.forEach(function(bullet){
                roll.addBullet(bullet);
            })
        }
        ctime++;
        if(ctime == 10) {
            window.clearInterval(timer);
        }
    }, 1000)
}

Main();