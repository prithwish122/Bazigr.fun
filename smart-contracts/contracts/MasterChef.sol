// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MasterChef
 * @notice Yield farming contract for staking LP tokens and earning BAZ rewards
 * @dev Uses existing BAZ token for rewards (pre-funded by owner)
 */
contract MasterChef is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;           // How many LP tokens the user has provided
        uint256 rewardDebt;       // Reward debt
        uint256 pendingRewards;   // Pending rewards not yet claimed
    }

    struct PoolInfo {
        IERC20 lpToken;           // Address of LP token contract
        uint256 allocPoint;       // Allocation points assigned to this pool
        uint256 lastRewardBlock;  // Last block number that BAZ distribution occurred
        uint256 accBAZPerShare;   // Accumulated BAZ per share, times 1e12
        uint256 totalStaked;      // Total amount of LP tokens staked in this pool
    }

    IERC20 public bazToken;
    uint256 public bazPerBlock;
    uint256 public constant BONUS_MULTIPLIER = 1;

    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    uint256 public totalAllocPoint = 0;
    uint256 public startBlock;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvest(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(uint256 indexed pid, address lpToken, uint256 allocPoint);
    event PoolUpdated(uint256 indexed pid, uint256 allocPoint);

    constructor(
        IERC20 _bazToken,
        uint256 _bazPerBlock,
        uint256 _startBlock
    ) Ownable(msg.sender) {
        bazToken = _bazToken;
        bazPerBlock = _bazPerBlock;
        startBlock = _startBlock;
    }

    /**
     * @notice Get number of pools
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /**
     * @notice Add a new LP pool
     */
    function add(uint256 _allocPoint, IERC20 _lpToken, bool _withUpdate) external onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accBAZPerShare: 0,
                totalStaked: 0
            })
        );
        emit PoolAdded(poolInfo.length - 1, address(_lpToken), _allocPoint);
    }

    /**
     * @notice Update allocation points of a pool
     */
    function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) external onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
        emit PoolUpdated(_pid, _allocPoint);
    }

    /**
     * @notice Update reward variables for all pools
     */
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    /**
     * @notice Update reward variables of the given pool
     */
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.totalStaked;
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 bazReward = (multiplier * bazPerBlock * pool.allocPoint) / totalAllocPoint;
        // No minting - rewards come from pre-funded balance
        pool.accBAZPerShare = pool.accBAZPerShare + ((bazReward * 1e12) / lpSupply);
        pool.lastRewardBlock = block.number;
    }

    /**
     * @notice Deposit LP tokens to MasterChef for BZG allocation
     */
    function deposit(uint256 _pid, uint256 _amount) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = ((user.amount * pool.accBAZPerShare) / 1e12) - user.rewardDebt;
            if (pending > 0) {
                user.pendingRewards = user.pendingRewards + pending;
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount + _amount;
            pool.totalStaked = pool.totalStaked + _amount;
        }
        user.rewardDebt = (user.amount * pool.accBAZPerShare) / 1e12;
        emit Deposit(msg.sender, _pid, _amount);
    }

    /**
     * @notice Withdraw LP tokens from MasterChef
     */
    function withdraw(uint256 _pid, uint256 _amount) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint256 pending = ((user.amount * pool.accBAZPerShare) / 1e12) - user.rewardDebt;
        if (pending > 0) {
            user.pendingRewards = user.pendingRewards + pending;
        }
        if (_amount > 0) {
            user.amount = user.amount - _amount;
            pool.totalStaked = pool.totalStaked - _amount;
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = (user.amount * pool.accBAZPerShare) / 1e12;
        emit Withdraw(msg.sender, _pid, _amount);
    }

    /**
     * @notice Harvest BAZ rewards
     */
    function harvest(uint256 _pid) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        uint256 pending = ((user.amount * pool.accBAZPerShare) / 1e12) - user.rewardDebt;
        uint256 totalPending = user.pendingRewards + pending;
        if (totalPending > 0) {
            user.pendingRewards = 0;
            safeBAZTransfer(msg.sender, totalPending);
            emit Harvest(msg.sender, _pid, totalPending);
        }
        user.rewardDebt = (user.amount * pool.accBAZPerShare) / 1e12;
    }

    /**
     * @notice Withdraw without caring about rewards (EMERGENCY ONLY)
     */
    function emergencyWithdraw(uint256 _pid) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        user.pendingRewards = 0;
        pool.totalStaked = pool.totalStaked - amount;
        pool.lpToken.safeTransfer(address(msg.sender), amount);
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }

    /**
     * @notice View function to see pending BAZ rewards on frontend
     */
    function pendingBAZ(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accBAZPerShare = pool.accBAZPerShare;
        uint256 lpSupply = pool.totalStaked;
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 bazReward = (multiplier * bazPerBlock * pool.allocPoint) / totalAllocPoint;
            accBAZPerShare = accBAZPerShare + ((bazReward * 1e12) / lpSupply);
        }
        return ((user.amount * accBAZPerShare) / 1e12) - user.rewardDebt + user.pendingRewards;
    }

    /**
     * @notice Get user staked amount in a pool
     */
    function getUserStaked(uint256 _pid, address _user) external view returns (uint256) {
        return userInfo[_pid][_user].amount;
    }

    /**
     * @notice Get pool total staked
     */
    function getPoolTotalStaked(uint256 _pid) external view returns (uint256) {
        return poolInfo[_pid].totalStaked;
    }

    /**
     * @notice Update BAZ per block (only owner)
     */
    function updateBAZPerBlock(uint256 _bazPerBlock) external onlyOwner {
        massUpdatePools();
        bazPerBlock = _bazPerBlock;
    }

    /**
     * @notice Safe BAZ transfer function, just in case if rounding error causes pool to not have enough BAZ
     */
    function safeBAZTransfer(address _to, uint256 _amount) internal {
        uint256 bazBal = bazToken.balanceOf(address(this));
        // Subtract staked LP tokens from balance (they shouldn't be used for rewards)
        uint256 availableRewards = bazBal;
        
        if (_amount > availableRewards) {
            bazToken.safeTransfer(_to, availableRewards);
        } else {
            bazToken.safeTransfer(_to, _amount);
        }
    }

    /**
     * @notice Fund the contract with BAZ rewards (only owner)
     */
    function fundRewards(uint256 _amount) external onlyOwner {
        bazToken.safeTransferFrom(msg.sender, address(this), _amount);
    }

    /**
     * @notice Get available reward balance
     */
    function getRewardBalance() external view returns (uint256) {
        return bazToken.balanceOf(address(this));
    }

    /**
     * @notice Return reward multiplier over the given _from to _to block
     */
    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256) {
        return (_to - _from) * BONUS_MULTIPLIER;
    }
}
