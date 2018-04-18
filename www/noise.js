window.noise = {
	tau: 2.0 * Math.PI,

	perlin2D: function (seed, x, y) {
		var gain = 0.25;//0.707106781;
		var octaves = 6;
		var total = 0;
		for (var i = 0; i < octaves; i++) {
			var frequency = Math.pow(2, i)/20.0;
			var amplitude = Math.pow(gain, i);
			total += this.biLerpedSmoothNoise(seed, x*frequency, y*frequency)*amplitude;
		}
		return total;
	},

	perlin3D: function (seed, x, y, z) {
		var gain = 0.25;//0.707106781;
		var octaves = 4;
		var total = 0;
		for (var i = 0; i < octaves; i++) {
			var frequency = Math.pow(2, i);
			var amplitude = Math.pow(gain, i);
			total += this.triLerpedSmoothNoise(seed, x*frequency, y*frequency, z*frequency)*amplitude;
		}
		return total;
	},

	circle: function (x, y, radius = 1) {
		x /= radius;
		y /= radius;
		return Math.max(0, 1 - (x * x + y * y));
	},

	ellipse: function (x, y, width = 1, height = 1) {
		x /= width;
		y /= height;
		return Math.max(0, 1 - (x * x + y * y));
	},

	sphere: function (x, y, z, radius = 1) {
		x /= radius;
		y /= radius;
		z /= radius;
		return math.max(0, 1 - (x * x + y * y + z * z));
	},

	ellipsoid: function (x, y, z, width = 1, height = 1, depth = 1) {
		x /= width;
		y /= height;
		z /= depth;
		return Math.max(0, 1 - (x * x + y * y + z * z));
	},

	spokes: function (x, y, count, radius = 1) {
		x /= radius;
		y /= radius;
		return -Math.sin(count * Math.atan2(y, x));
	},

	starScape2D: function (seed, x, y, sparsity = 8) {
		x /= sparsity;
		y /= sparsity;
		let step = 1 / sparsity;
		let p = this.biLerpedSmoothNoise(seed, x, y);
		if (this.biLerpedSmoothNoise(seed, x - step, y       ) < p ||
			  this.biLerpedSmoothNoise(seed, x + step, y       ) < p ||
			  this.biLerpedSmoothNoise(seed, x       , y - step) < p ||
			  this.biLerpedSmoothNoise(seed, x       , y + step) < p)
			return 0;
		return 1;
	},

	starScape3D: function (seed, x, y, z, sparsity = 8) {
		x /= sparsity;
		y /= sparsity;
		z /= sparsity;
		let step = 1 / sparsity;
		let p = this.triLerpedSmoothNoise(seed, x, y, z);
		if (this.triLerpedSmoothNoise(seed, x - step, y       , z       ) < p ||
			  this.triLerpedSmoothNoise(seed, x + step, y       , z       ) < p ||
			  this.triLerpedSmoothNoise(seed, x       , y - step, z       ) < p ||
			  this.triLerpedSmoothNoise(seed, x       , y + step, z       ) < p ||
			  this.triLerpedSmoothNoise(seed, x       , y       , z - step) < p ||
			  this.triLerpedSmoothNoise(seed, x       , y       , z + step) < p)
			return 0;
		return 1;
	},

	fBm: function (seed, x, y, z) {
		var gain = 0.5;
		var lacunarity = 2;
		var frequency = 1.0;
		var amplitude = 10;
		var octaves = 4;
		var total = 0;
		for (var i = 0; i < octaves; i++) {
			total += this.triLerpedSmoothNoise(seed, x*frequency, y*frequency, z*frequency)*amplitude;
			frequency *= lacunarity;
			amplitude *= gain;
		}
		return total;
	},

	biLerpedSmoothNoise: function (seed, x, y) {
		var xi = Math.floor(x);
		var yi = Math.floor(y);
		var muX = x-xi;
		var muY = y-yi;
		return this.biLerp(this.smooth2D(seed, xi, yi), this.smooth2D(seed, xi+1, yi), this.smooth2D(seed, xi, yi+1), this.smooth2D(seed, xi+1, yi+1), muX, muY);
	},

	triLerpedSmoothNoise: function (seed, x, y, z) {
		var xi = Math.floor(x);
		var yi = Math.floor(y);
		var zi = Math.floor(z);
		var muX = x-xi;
		var muY = y-yi;
		var muZ = z-zi;
		return this.lerp(this.biLerp(this.smooth3D(seed, xi, yi, zi), this.smooth3D(seed, xi+1, yi, zi), this.smooth3D(seed, xi, yi+1, zi), this.smooth3D(seed, xi+1, yi+1, zi), muX, muY),
				this.biLerp(this.smooth3D(seed, xi, yi, zi+1), this.smooth3D(seed, xi+1, yi, zi+1), this.smooth3D(seed, xi, yi+1, zi+1), this.smooth3D(seed, xi+1, yi+1, zi+1), muX, muY), muZ);
	},

	triLerp: function (cs, muX, muY, muZ) {
		return this.lerp(this.biLerp(cs[0][0][0], cs[1][0][0], cs[0][1][0], cs[1][1][0], muX, muY),
				this.biLerp(cs[0][0][1], cs[1][0][1], cs[0][1][1], cs[1][1][1], muX, muY), muZ);
	},

	biLerp: function (c00, c10, c01, c11, muX, muY) {
		return this.lerp(this.lerp(c00, c10, muX), this.lerp(c01, c11, muX), muY);
	},

	lerp: function (x0, x1, mu) {
		return x0+(x1-x0)*mu;
	},

	threshold: function (n, threshold) {
		return n <= threshold ? 0 : 1;
	},

	smooth2D: function (seed, x, y) {
		var corners = (this.noise(seed,x-1,y-1,0)+this.noise(seed,x+1,y-1,0)+this.noise(seed,x-1,y+1,0)+this.noise(seed,x+1,y+1,0))/16;
		var sides = (this.noise(seed,x-1,y,0)+this.noise(seed,x+1,y,0)+this.noise(seed,x,y-1,0)+this.noise(seed,x,y+1,0))/8;
		return corners + sides + this.noise(seed,x,y,0)/4;
	},

	smooth3D: function (seed, x, y, z) {
		var edges = (this.noise(seed,x-1,y-1,z)+this.noise(seed,x+1,y-1,z)+this.noise(seed,x-1,y+1,z)+this.noise(seed,x+1,y+1,z)
				+this.noise(seed,x,y-1,z-1)+this.noise(seed,x-1,y,z-1)+this.noise(seed,x+1,y,z-1)+this.noise(seed,x,y+1,z-1)
				+this.noise(seed,x,y-1,z+1)+this.noise(seed,x-1,y,z+1)+this.noise(seed,x+1,y,z+1)+this.noise(seed,x,y+1,z+1))/16;
		var corners = (this.noise(seed,x-1,y-1,z-1)+this.noise(seed,x+1,y-1,z-1)+this.noise(seed,x-1,y+1,z-1)+this.noise(seed,x+1,y+1,z-1)
				+this.noise(seed,x-1,y-1,z+1)+this.noise(seed,x+1,y-1,z+1)+this.noise(seed,x-1,y+1,z+1)+this.noise(seed,x+1,y+1,z+1))/32;
		var sides = (this.noise(seed,x,y-1,z)+this.noise(seed,x-1,y,z)+this.noise(seed,x+1,y,z)+this.noise(seed,x,y+1,z)+this.noise(seed,x,y,z-1)+this.noise(seed,x,y,z+1))/8;
		return edges + corners + sides + this.noise(seed,x,y,z)/4;
	},

	/**
	 * Jenkins' hash the seeds in sequence and normalize to [-1.0, 1.0).
	 */
	noise: function (...seeds) {
		var hash = 0;
		for (let seed of seeds) {
			for (let i = 0; i < 4; ++i) {
				hash += seed & 0xFF;
				hash += hash <<  10;
				hash ^= hash >>> 6;
				seed >>= 8;
			}
		}
		hash += hash <<  3;
		hash ^= hash >>> 11;
		hash += hash <<  15;
		return ((hash >>> 0) / 2147483648.0) - 1.0;
	},

	normal: function (...seed) {
		return (this.noise(0, ...seed) + this.noise(1, ...seed) + this.noise(2, ...seed) + this.noise(3, ...seed) + this.noise(4, ...seed) + this.noise(5, ...seed)) / 6;
	},

	/**
	 * Generate a linearly congruent random number in the range [-1.0, 1.0) implicitly.
	 */
	// TODO: Design an thoroughly test a fast noise algorithm and investigate how fast % is vs &.
	_noise: function (seed = 0, x = 0, y = 0, z = 0) {
		// FIXME: This would obviously create patterns very quickly.
		var n = x + y * 89 + z * 4173 + seed * 110133;
		n = (n >> 13) ^ n;
		return 1.0 - (((n * (n * n * 15731 + 789221) + 1376312589) % 0x7FFFFFFF) / 1073741824.0);
		//return 1.0 - (((n * (n * n * 60493 + 19990303) + 1376312589) % 0x7FFFFFFF) / 1073741824.0);
		//return ((seed*717815713 ^ x* 862079717 ^ y*809893709 ^ z*743349007)&0x3FFFFFFF)/536870911 - 1;
	}
};
