// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract BBLToken is ERC20, Ownable, Pausable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant AD_CAMPAIGN_MIN = 100 * 10**18; // Minimum 100 tokens for ad campaign
    
    mapping(address => bool) public isAdvertiser;
    mapping(address => Campaign[]) public advertiserCampaigns;
    
    struct Campaign {
        uint256 id;
        string name;
        uint256 budget;
        uint256 impressions;
        uint256 engagement;
        bool isActive;
        uint256 startTime;
        uint256 endTime;
    }
    
    event CampaignCreated(
        address indexed advertiser,
        uint256 indexed campaignId,
        string name,
        uint256 budget
    );
    
    event CampaignUpdated(
        uint256 indexed campaignId,
        bool isActive,
        uint256 impressions,
        uint256 engagement
    );
    
    constructor() ERC20("Build Bridge Learn", "BBL") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function registerAsAdvertiser() public {
        require(balanceOf(msg.sender) >= AD_CAMPAIGN_MIN, "Insufficient BBL balance");
        isAdvertiser[msg.sender] = true;
    }
    
    function createCampaign(
        string memory name,
        uint256 budget,
        uint256 duration
    ) public whenNotPaused {
        require(isAdvertiser[msg.sender], "Not registered as advertiser");
        require(budget >= AD_CAMPAIGN_MIN, "Budget below minimum");
        require(balanceOf(msg.sender) >= budget, "Insufficient balance");
        
        // Lock tokens for campaign
        _transfer(msg.sender, address(this), budget);
        
        Campaign memory newCampaign = Campaign({
            id: advertiserCampaigns[msg.sender].length,
            name: name,
            budget: budget,
            impressions: 0,
            engagement: 0,
            isActive: true,
            startTime: block.timestamp,
            endTime: block.timestamp + duration
        });
        
        advertiserCampaigns[msg.sender].push(newCampaign);
        
        emit CampaignCreated(
            msg.sender,
            newCampaign.id,
            name,
            budget
        );
    }
    
    function updateCampaignMetrics(
        uint256 campaignId,
        uint256 newImpressions,
        uint256 newEngagement
    ) public onlyOwner {
        Campaign storage campaign = advertiserCampaigns[msg.sender][campaignId];
        require(campaign.isActive, "Campaign not active");
        
        campaign.impressions = newImpressions;
        campaign.engagement = newEngagement;
        
        emit CampaignUpdated(
            campaignId,
            campaign.isActive,
            newImpressions,
            newEngagement
        );
    }
    
    function endCampaign(uint256 campaignId) public {
        Campaign storage campaign = advertiserCampaigns[msg.sender][campaignId];
        require(campaign.isActive, "Campaign not active");
        require(msg.sender == owner() || block.timestamp >= campaign.endTime, "Campaign still active");
        
        campaign.isActive = false;
        
        // Return unused budget
        uint256 unusedBudget = calculateUnusedBudget(campaign);
        if (unusedBudget > 0) {
            _transfer(address(this), msg.sender, unusedBudget);
        }
    }
    
    function calculateUnusedBudget(Campaign memory campaign) internal pure returns (uint256) {
        // Implement budget calculation based on impressions and engagement
        // This is a simplified version
        uint256 used = (campaign.impressions * 1e15) + (campaign.engagement * 1e16);
        return used < campaign.budget ? campaign.budget - used : 0;
    }
    
    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }
}
