/**
 * 
 * @param {*} parm 
 * @param {*} node 
 */
function setCss(parm, node) {
    var reg = /[A-Z]/g;
    var str = '';
    var keys = Object.keys(parm);
    keys.forEach(function (key) {
        str += `${reg.test(key) ? key.replace(reg, function() {return `-${arguments[0].toLowerCase()}`}) : key}: ${parm[key]};`;
    })
    // return str;

    node.style.cssText += str;
}


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


var Track, Main, Bullet, TrackList, BulletList, Controller;

var data = [{
    ctime: 0,
    content: '第一',
    type: 0,
    color: '#fff',
    fontSize: 0
}, {
    ctime: 1,
    content: '第二',
    type: 0,
    color: '#fff',
    fontSize: 0
}, {
    ctime: 4021,
    content: '第三',
    type: 0,
    color: '#fff',
    fontSize: 0
}]

var lineHeight = 20;

parm = {
    ctime: 2000,
    content: '.....',
    type: 0,
    color: '#fff',
    fontSize: 0,
}

// 画面轨道类
Track = function (num) {
    this.bulletList = [];
    this.flag = true;
    this.trackNum = num;

    this.checkstart = false;
    this.checkend = false;

    this.timer = window.setInterval(function () {
        var bullet = this.bulletList;
        if (this.checkend) {
            var target = bullet[bullet.length - 1];
            if (target.offsetRight() >= 0) {
                this.subject.notify({
                    track: that.track,
                    state: 0
                });
                this.checkend = false;
                this.checkstart = true;
            }
        }

        if (this.checkstart) {
            var target = bullet[0];
            if (target.offsetLeft() <= -target.offsetWidth()) {
                target.remove();

            }
        }
    }, 1000);

    this.subject = new Subject();

}

Track.prototype.addBullet = function (Bullet) {
    var that = this;


    var dan = document.querySelector('#danmuContent');
    dan.appendChild(Bullet.get());


    this.bulletList.push(Bullet);


    // this.update(Bullet);
    Bullet.load(this.trackNum);


    this.checkend = true;
}

Track.prototype.getState = function () {
    return this.flag;
}

Track.prototype.setTrackNum = function (num) {
    this.trackNum = num;
}

Track.prototype.getTrackNum = function () {
    return this.trackNum;
}

Track.prototype.addObserver = function (Obs) {
    var that = this;
    this.subject.addObserver(Obs);
    this.subject.notify({
        track: that.trackNum,
        state: 0
    })
}

Track.prototype.insert = function () {

}

Track.prototype.notifyClose = function () {
    var that = this;
    this.subject.notify({
        track: that.trackNum,
        state: 1
    })
}


TrackList = function (target) {
    var tracklist = [];
    var element = target;

    this.getLength = function () {
        return tracklist.length;
    }

    this.addTrack = function (track) {
        // track.update = function (bullet) {
        //     element.appendChild(bullet);
        // }

        tracklist.push(track);
    }

    this.indexOf = function (index) {
        if (index > -1 && index < tracklist.length) {
            return tracklist[index];
        }
    }

}

// 弹幕类
Bullet = function (bulletData) {
    /**
     * @param{Number} time 弹幕出现时间
     * @param{Number} type 弹幕类型
     * @param{Dom} bullet 弹幕实体对象
     * @param{Function} subject 观察目标实例
     */

    this.time = bulletData.ctime;
    this.type = bulletData.type;
    this.bullet = document.createElement('div');

    this.bullet.innerHTML = bulletData.content;
    var that = this;

    setCss({
        whiteSpace: 'pre',
        userSelect: 'none',
        position: 'absolute',
        willChange: 'transform',
        fontSize: `${bulletData.fontSize == 0 ? '20px' : '25px'}`,
        fontFamily: 'SimHei, Arial, Helvetica, sans-serif',
        textShadow: 'rgb(0, 0, 0) 1px 0px 1px, rgb(0, 0, 0) 0px 1px 1px, rgb(0, 0, 0) 0px -1px 1px, rgb(0, 0, 0) -1px 0px 1px',
        perspective: '500px',
        display: 'inline-block',
        fontWeight: 'blod',
        lineHeight: '1.125',
        opacity: 1,
        color: bulletData.color,
        left: `${this.type == 0 ? '100%' : '50%'}`,
        transform: `${this.type !== 0 ? 'translateX(-50%)' : ''}`
    }, this.bullet);
}

Bullet.prototype.load = function (num) {
    /**
     * param{Number} bulletWidth 弹幕对象宽度
     */
    var bulletWidth = this.bullet.offsetWidth;
    var width = document.querySelector('#danmuContent').offsetWidth;
    var that = this;
    console.log(width + bulletWidth);
    var offset = width + bulletWidth;
    var v = num * 20;
    console.log(v);
    setCss({
        top: `${this.type !== 2 ? v + 'px' : ''}`,
        bottom: `${this.type == 2 ? v + 'px' : ''}`,
        transition: `${this.type == 0 ? 'transform 5s linear 0s' : ''}`,
        transform: `${this.type == 0 ? 'translateX(-' + offset + 'px)' : ''}`
    }, this.bullet);

}

Bullet.prototype.remove = function () {
    delete this.bullet.parentElement.remove(this.bullet);
}


Bullet.prototype.get = function () {
    return this.bullet;
}

Bullet.prototype.offsetLeft = function () {
    return this.bullet.offsetLeft;
}

Bullet.prototype.offsetRight = function () {
    return this.bullet.offsetRight;
}

Bullet.prototype.offsetWidth = function () {
    return this.bullet.offsetWidth;
}

Bullet.prototype.getTime = function () {
    return this.time;
}

/** */

BulletList = function () {
    this.bulletlist = [];

    this.addBullet = function (bullet) {
        this.bulletlist.push(bullet);
    }

    this.sort = function () {
        var list = this.bulletlist.sort(function (a, b) {
            return a.ctime < b.ctime;
        })
    }

}



Controller = function () {
    var bulletCache = [];
    var waitList = {};
    var tracks = [];
    var timer;
    var length = 0;
    var bulletWaitlist = [];

    var observer = new Observer();
    observer.update = function (ctx) {
        if (ctx.state == 0) {
            // waitList[ctx.track] = function () {
            //     return tracks[ctx.track]
            // }
            // length++;
            console.log(tracks);
            if (bulletCache.length > 0) {
                console.log(tracks[ctx.track])
                tracks[ctx.track].addBullet(bulletCache.pop());
            } else {
                length++;
            }
        }

        if (ctx.state == 1) {
            delete waitList[ctx.track];
            length--;
        }
    }

    this.pushBullet = function (Bullet) {
        bulletCache.push(Bullet);

        if (length == 0 || tracks.length == 0) {
            var track = new Track(tracks.length);
            tracks.push(track);
            track.addObserver(observer);
        }


    }



}

function bulletList() {
    var list = {};

    this.addBullet = function (bullet) {
        // list.push(bullet);
        var time = bullet.getTime();
        var i = Math.floor(time / 1000);

        if (typeof list[i] == 'undefined') {
            list[i] = [bullet]
        } else {
            list[i].push(bullet);
        }
    }

    this.getBullet = function (s) {
        return list[s];
    }
}





// 调度中心类

Main = function () {
    var wrap = document.querySelector('#danmuContent');
    var line = Math.floor(wrap.offsetHeight / lineHeight);

    var controller = new Controller();

    var bulletlist = new bulletList();

    data.forEach(function (item) {
        var bullet = new Bullet(item);
        bulletlist.addBullet(bullet);
    })

    var ctime = 0;

    window.setInterval(function () {
        var list = bulletlist.getBullet(ctime);
        if (typeof list !== 'undefined') {
            list.forEach(function (bullet) {
                controller.pushBullet(bullet);
            })
        }
        ctime += 1;
    }, 1000);

}

Main();